/**
 * 历史记录存储系统
 *
 * 设计理念：
 * - 使用适配器模式，支持本地存储和云端数据库的无缝切换
 * - 通过环境变量控制存储方式
 * - 本地测试使用 localStorage，上线后切换到数据库
 */

// 历史记录数据结构
export interface HistoryItem {
  id: number;
  templateId: string;
  templateTitle: string;
  content: string;
  result: string;
  timestamp: Date;
}

// 存储适配器接口
export interface StorageAdapter {
  // 获取指定模板的历史记录
  getHistory(templateId: string): Promise<HistoryItem[]>;

  // 添加历史记录
  addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem>;

  // 删除历史记录
  deleteHistory(id: number): Promise<void>;

  // 清空指定模板的历史记录
  clearHistory(templateId: string): Promise<void>;

  // 获取所有历史记录（跨模板）
  getAllHistory(): Promise<HistoryItem[]>;
}

/**
 * LocalStorage 适配器
 * 用于本地测试，数据持久化存储在浏览器中
 */
class LocalStorageAdapter implements StorageAdapter {
  private readonly STORAGE_KEY = 'ai_writing_history';

  // 从 localStorage 读取所有历史记录
  private readAllHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      // 将 timestamp 字符串转换回 Date 对象
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (error) {
      console.error('读取历史记录失败:', error);
      return [];
    }
  }

  // 保存所有历史记录到 localStorage
  private saveAllHistory(history: HistoryItem[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  async getHistory(templateId: string): Promise<HistoryItem[]> {
    const allHistory = this.readAllHistory();
    return allHistory
      .filter(item => item.templateId === templateId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> {
    const allHistory = this.readAllHistory();

    const newItem: HistoryItem = {
      ...item,
      id: Date.now(),
      timestamp: new Date(),
    };

    allHistory.unshift(newItem);

    // 限制每个模板最多保存 50 条历史记录
    const templateHistory = allHistory.filter(h => h.templateId === item.templateId);
    if (templateHistory.length > 50) {
      const oldestId = templateHistory[templateHistory.length - 1].id;
      const filteredHistory = allHistory.filter(h => h.id !== oldestId);
      this.saveAllHistory(filteredHistory);
    } else {
      this.saveAllHistory(allHistory);
    }

    return newItem;
  }

  async deleteHistory(id: number): Promise<void> {
    const allHistory = this.readAllHistory();
    const filteredHistory = allHistory.filter(item => item.id !== id);
    this.saveAllHistory(filteredHistory);
  }

  async clearHistory(templateId: string): Promise<void> {
    const allHistory = this.readAllHistory();
    const filteredHistory = allHistory.filter(item => item.templateId !== templateId);
    this.saveAllHistory(filteredHistory);
  }

  async getAllHistory(): Promise<HistoryItem[]> {
    return this.readAllHistory()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

/**
 * Database 适配器
 * 用于生产环境，数据存储在云端数据库
 *
 * 注意：这是预留接口，上线时需要实现具体的数据库逻辑
 */
class DatabaseAdapter implements StorageAdapter {
  private readonly API_BASE = '/api/history';

  async getHistory(templateId: string): Promise<HistoryItem[]> {
    try {
      const response = await fetch(`${this.API_BASE}?templateId=${templateId}`);
      if (!response.ok) throw new Error('获取历史记录失败');

      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  async addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> {
    try {
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      if (!response.ok) throw new Error('添加历史记录失败');

      const data = await response.json();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
      };
    } catch (error) {
      console.error('添加历史记录失败:', error);
      throw error;
    }
  }

  async deleteHistory(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除历史记录失败');
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }

  async clearHistory(templateId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) throw new Error('清空历史记录失败');
    } catch (error) {
      console.error('清空历史记录失败:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<HistoryItem[]> {
    try {
      const response = await fetch(this.API_BASE);
      if (!response.ok) throw new Error('获取所有历史记录失败');

      const data = await response.json();
      return data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
    } catch (error) {
      console.error('获取所有历史记录失败:', error);
      return [];
    }
  }
}

/**
 * 存储管理器
 * 根据环境变量自动选择合适的存储适配器
 */
class HistoryStorageManager {
  private adapter: StorageAdapter;

  constructor() {
    // 通过环境变量控制存储方式
    // 本地测试：USE_DATABASE=false 或不设置
    // 生产环境：USE_DATABASE=true
    const useDatabase = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

    if (useDatabase) {
      console.log('📊 使用数据库存储历史记录');
      this.adapter = new DatabaseAdapter();
    } else {
      console.log('💾 使用本地存储历史记录');
      this.adapter = new LocalStorageAdapter();
    }
  }

  // 获取指定模板的历史记录
  async getHistory(templateId: string): Promise<HistoryItem[]> {
    return this.adapter.getHistory(templateId);
  }

  // 添加历史记录
  async addHistory(
    templateId: string,
    templateTitle: string,
    content: string,
    result: string
  ): Promise<HistoryItem> {
    return this.adapter.addHistory({
      templateId,
      templateTitle,
      content,
      result,
    });
  }

  // 删除历史记录
  async deleteHistory(id: number): Promise<void> {
    return this.adapter.deleteHistory(id);
  }

  // 清空指定模板的历史记录
  async clearHistory(templateId: string): Promise<void> {
    return this.adapter.clearHistory(templateId);
  }

  // 获取所有历史记录
  async getAllHistory(): Promise<HistoryItem[]> {
    return this.adapter.getAllHistory();
  }
}

// 导出单例实例
export const historyStorage = new HistoryStorageManager();
