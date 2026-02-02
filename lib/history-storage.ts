/**
 * 历史记录存储系统
 *
 * 设计理念：
 * - 使用适配器模式，支持本地存储和云端数据库的无缝切换
 * - 通过环境变量控制存储方式
 * - 本地测试使用 localStorage，上线后切换到数据库
 * - 自动将旧ID转换为规范ID，确保历史记录统一
 */

import { getCanonicalId } from './template-config';

// 对话消息结构
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// 历史记录数据结构
export interface HistoryItem {
  id: number;
  templateId: string;
  templateTitle: string;
  content: string;  // 保留用于向后兼容（首次用户输入）
  result: string;   // 保留用于向后兼容（最终AI结果）
  conversations?: ConversationMessage[];  // 完整对话记录（新增）
  timestamp: Date;
}

/**
 * 规范化模板ID
 * 将旧ID转换为规范ID，确保历史记录统一
 */
function normalizeTemplateId(templateId: string | number): string {
  const numId = typeof templateId === 'string' ? parseInt(templateId) : templateId;
  const canonicalId = getCanonicalId(numId);

  if (canonicalId !== numId) {
    console.log(`🔄 ID规范化: ${numId} → ${canonicalId}`);
  }

  return canonicalId.toString();
}

// 存储适配器接口
export interface StorageAdapter {
  // 获取指定模板的历史记录
  getHistory(templateId: string): Promise<HistoryItem[]>;

  // 添加历史记录
  addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem>;

  // 更新历史记录（新增）
  updateHistory(id: number, item: Partial<Omit<HistoryItem, 'id' | 'timestamp'>>): Promise<HistoryItem>;

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
      // 抛出异常，让调用方知道保存失败
      throw new Error('保存历史记录失败：' + (error instanceof Error ? error.message : '存储空间不足或浏览器限制'));
    }
  }

  async getHistory(templateId: string): Promise<HistoryItem[]> {
    // 规范化模板ID
    const canonicalId = normalizeTemplateId(templateId);
    console.log(`📖 读取历史记录: 原始ID=${templateId}, 规范ID=${canonicalId}`);

    const allHistory = this.readAllHistory();

    // 获取所有可能的ID（包括规范ID和旧ID）
    // 这样可以合并使用不同ID保存的历史记录
    const filteredHistory = allHistory
      .filter(item => {
        const itemCanonicalId = normalizeTemplateId(item.templateId);
        const matches = itemCanonicalId === canonicalId;
        if (matches) {
          console.log(`  ✓ 匹配历史记录: 存储ID=${item.templateId}, 规范ID=${itemCanonicalId}`);
        }
        return matches;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    console.log(`📊 找到 ${filteredHistory.length} 条历史记录`);
    return filteredHistory;
  }

  async addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> {
    const allHistory = this.readAllHistory();

    // 规范化模板ID，确保使用规范ID保存
    const canonicalId = normalizeTemplateId(item.templateId);

    const newItem: HistoryItem = {
      ...item,
      templateId: canonicalId, // 使用规范ID
      id: Date.now(),
      timestamp: new Date(),
    };

    allHistory.unshift(newItem);

    // 限制每个模板最多保存 50 条历史记录
    // 注意：这里需要考虑所有规范化后相同的ID
    const templateHistory = allHistory.filter(h => {
      const hCanonicalId = normalizeTemplateId(h.templateId);
      return hCanonicalId === canonicalId;
    });

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

  async updateHistory(id: number, updates: Partial<Omit<HistoryItem, 'id' | 'timestamp'>>): Promise<HistoryItem> {
    const allHistory = this.readAllHistory();
    const index = allHistory.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error('历史记录不存在');
    }

    // 更新记录
    const updatedItem: HistoryItem = {
      ...allHistory[index],
      ...updates,
      id: allHistory[index].id,  // 保持ID不变
      timestamp: allHistory[index].timestamp,  // 保持原始时间戳
    };

    allHistory[index] = updatedItem;
    this.saveAllHistory(allHistory);

    return updatedItem;
  }

  async clearHistory(templateId: string): Promise<void> {
    // 规范化模板ID
    const canonicalId = normalizeTemplateId(templateId);

    const allHistory = this.readAllHistory();

    // 清除所有规范化后ID相同的历史记录
    const filteredHistory = allHistory.filter(item => {
      const itemCanonicalId = normalizeTemplateId(item.templateId);
      return itemCanonicalId !== canonicalId;
    });

    this.saveAllHistory(filteredHistory);
  }

  async getAllHistory(): Promise<HistoryItem[]> {
    return this.readAllHistory()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 迁移历史记录ID
   * 将所有旧ID的历史记录更新为规范ID
   */
  migrateHistoryIds(): void {
    if (typeof window === 'undefined') return;

    const allHistory = this.readAllHistory();
    let hasChanges = false;

    const migratedHistory = allHistory.map(item => {
      const canonicalId = normalizeTemplateId(item.templateId);
      if (canonicalId !== item.templateId) {
        hasChanges = true;
        console.log(`迁移历史记录: ${item.templateId} → ${canonicalId}`);
        return {
          ...item,
          templateId: canonicalId,
        };
      }
      return item;
    });

    if (hasChanges) {
      this.saveAllHistory(migratedHistory);
      console.log('✅ 历史记录ID迁移完成');
    }
  }
}

/**
 * Database 适配器
 * 用于生产环境，数据存储在云端数据库（Supabase）
 */
class DatabaseAdapter implements StorageAdapter {
  private readonly API_BASE = '/api/history';

  /**
   * 获取认证token
   * 从Supabase获取当前用户的session token
   */
  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      // 动态导入supabase客户端，避免服务端执行
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('获取认证token失败:', error);
      return null;
    }
  }

  /**
   * 获取带认证的请求头
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 映射数据库字段到HistoryItem
   * 数据库使用created_at，前端使用timestamp
   */
  private mapToHistoryItem(item: any): HistoryItem {
    return {
      id: item.id,
      templateId: item.template_id,
      templateTitle: item.template_title,
      content: item.content,
      result: item.result,
      timestamp: new Date(item.created_at || item.timestamp),
    };
  }

  async getHistory(templateId: string): Promise<HistoryItem[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.API_BASE}?templateId=${templateId}`, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('未登录，无法获取历史记录');
          return [];
        }
        throw new Error('获取历史记录失败');
      }

      const data = await response.json();
      return data.map(this.mapToHistoryItem);
    } catch (error) {
      console.error('获取历史记录失败:', error);
      return [];
    }
  }

  async addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.API_BASE, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          templateId: item.templateId,
          templateTitle: item.templateTitle,
          content: item.content,
          result: item.result,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('未登录，无法保存历史记录');
        }
        throw new Error('添加历史记录失败');
      }

      const data = await response.json();
      return this.mapToHistoryItem(data);
    } catch (error) {
      console.error('添加历史记录失败:', error);
      throw error;
    }
  }

  async deleteHistory(id: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('未登录，无法删除历史记录');
        }
        throw new Error('删除历史记录失败');
      }
    } catch (error) {
      console.error('删除历史记录失败:', error);
      throw error;
    }
  }

  async updateHistory(id: number, updates: Partial<Omit<HistoryItem, 'id' | 'timestamp'>>): Promise<HistoryItem> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('未登录，无法更新历史记录');
        }
        throw new Error('更新历史记录失败');
      }

      const data = await response.json();
      return this.mapToHistoryItem(data);
    } catch (error) {
      console.error('更新历史记录失败:', error);
      throw error;
    }
  }

  async clearHistory(templateId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.API_BASE}/clear`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('未登录，无法清空历史记录');
        }
        throw new Error('清空历史记录失败');
      }
    } catch (error) {
      console.error('清空历史记录失败:', error);
      throw error;
    }
  }

  async getAllHistory(): Promise<HistoryItem[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(this.API_BASE, {
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('未登录，无法获取历史记录');
          return [];
        }
        throw new Error('获取所有历史记录失败');
      }

      const data = await response.json();
      return data.map(this.mapToHistoryItem);
    } catch (error) {
      console.error('获取所有历史记录失败:', error);
      return [];
    }
  }
}

/**
 * 存储管理器
 * 根据环境变量控制存储方式
 *
 * 存储策略：
 * 1. 如果配置使用数据库 → 强制使用数据库存储（需要登录）
 * 2. 如果配置使用本地存储 → 使用本地存储（无需登录）
 */
class HistoryStorageManager {
  private databaseAdapter: DatabaseAdapter;
  private localAdapter: LocalStorageAdapter;
  private useDatabase: boolean;

  constructor() {
    // 通过环境变量控制存储方式
    // 本地测试：USE_DATABASE=false 或不设置
    // 生产环境：USE_DATABASE=true
    this.useDatabase = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

    // 初始化适配器
    this.databaseAdapter = new DatabaseAdapter();
    this.localAdapter = new LocalStorageAdapter();

    // 立即执行历史记录ID迁移（不延迟）
    if (typeof window !== 'undefined') {
      this.localAdapter.migrateHistoryIds();
    }

    console.log(`📊 存储配置: ${this.useDatabase ? '云端数据库存储（需要登录）' : '本地存储'}`);
  }

  /**
   * 获取当前应该使用的适配器
   * 如果配置使用数据库，直接返回数据库适配器（需要登录）
   * 如果配置使用本地存储，返回本地存储适配器
   */
  private async getAdapter(): Promise<StorageAdapter> {
    if (!this.useDatabase) {
      return this.localAdapter;
    }

    // 使用数据库存储，直接返回数据库适配器
    // DatabaseAdapter 内部会处理未登录的情况（抛出401错误）
    return this.databaseAdapter;
  }

  // 获取指定模板的历史记录
  async getHistory(templateId: string): Promise<HistoryItem[]> {
    const adapter = await this.getAdapter();
    return adapter.getHistory(templateId);
  }

  // 添加历史记录
  async addHistory(
    templateId: string,
    templateTitle: string,
    content: string,
    result: string,
    conversations?: ConversationMessage[]
  ): Promise<HistoryItem> {
    // 规范化模板ID
    const canonicalId = normalizeTemplateId(templateId);

    const adapter = await this.getAdapter();
    return adapter.addHistory({
      templateId: canonicalId,
      templateTitle,
      content,
      result,
      conversations,
    });
  }

  // 更新历史记录（新增）
  async updateHistory(
    id: number,
    updates: {
      content?: string;
      result?: string;
      conversations?: ConversationMessage[];
    }
  ): Promise<HistoryItem> {
    const adapter = await this.getAdapter();
    return adapter.updateHistory(id, updates);
  }

  // 删除历史记录
  async deleteHistory(id: number): Promise<void> {
    const adapter = await this.getAdapter();
    return adapter.deleteHistory(id);
  }

  // 清空指定模板的历史记录
  async clearHistory(templateId: string): Promise<void> {
    const adapter = await this.getAdapter();
    return adapter.clearHistory(templateId);
  }

  // 获取所有历史记录
  async getAllHistory(): Promise<HistoryItem[]> {
    const adapter = await this.getAdapter();
    return adapter.getAllHistory();
  }
}

// 导出单例实例
export const historyStorage = new HistoryStorageManager();
