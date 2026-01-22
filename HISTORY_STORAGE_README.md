# 历史记录存储系统使用说明

## 📋 概述

本项目实现了灵活的历史记录存储系统，支持本地测试和云端数据库的无缝切换。

## 🎯 功能特性

### ✅ 已实现
- ✨ 按模板分类存储历史记录
- 💾 本地 localStorage 持久化存储
- 🔄 自动加载和保存历史记录
- 🗑️ 删除单条历史记录
- 📊 每个模板最多保存 50 条记录
- 🔀 环境变量控制存储方式切换

### 🚧 待实现（上线时）
- 🌐 云端数据库存储
- 👤 用户账号系统集成
- 🔄 多设备数据同步

## 🚀 快速开始

### 本地测试（当前配置）

1. **环境变量已配置**
   ```env
   NEXT_PUBLIC_USE_DATABASE=false
   ```

2. **数据存储位置**
   - 浏览器 localStorage
   - Key: `ai_writing_history`

3. **数据持久性**
   - ✅ 刷新页面：数据保留
   - ✅ 关闭浏览器：数据保留
   - ✅ 重启电脑：数据保留
   - ❌ 清除浏览器数据：数据丢失

4. **测试步骤**
   ```bash
   # 1. 启动开发服务器（已启动）
   npm run dev

   # 2. 访问应用
   http://localhost:3000

   # 3. 使用任意模板创作内容

   # 4. 查看历史记录
   # 点击右侧"历史创作结果"标签

   # 5. 验证持久化
   # 刷新页面，历史记录仍然存在
   ```

## 📦 数据结构

每条历史记录包含：
```typescript
{
  id: number;              // 唯一标识（时间戳）
  templateId: string;      // 模板ID（如 "1", "2"）
  templateTitle: string;   // 模板标题（如 "小红书爆款文案"）
  content: string;         // 用户输入的内容
  result: string;          // AI 生成的结果
  timestamp: Date;         // 创建时间
}
```

## 🔧 上线部署指南

### 步骤 1: 实现数据库 API

创建 `app/api/history/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
// 导入你的数据库客户端（Prisma, MongoDB, etc.）

export async function GET(request: NextRequest) {
  const templateId = request.nextUrl.searchParams.get("templateId");

  // 从数据库查询
  const history = await db.history.findMany({
    where: { templateId },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json(history);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 保存到数据库
  const newItem = await db.history.create({
    data: {
      ...body,
      timestamp: new Date(),
    },
  });

  return NextResponse.json(newItem);
}
```

创建 `app/api/history/[id]/route.ts`:

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.history.delete({
    where: { id: parseInt(params.id) },
  });

  return NextResponse.json({ success: true });
}
```

### 步骤 2: 修改环境变量

在 Vercel 或其他部署平台设置：
```env
NEXT_PUBLIC_USE_DATABASE=true
```

### 步骤 3: 部署应用

```bash
# 提交代码
git add .
git commit -m "feat: 添加历史记录数据库支持"
git push

# Vercel 会自动部署
```

### 步骤 4: 验证切换

1. 访问生产环境
2. 创建一些历史记录
3. 检查数据库中是否有数据
4. 刷新页面验证数据加载

## 🔍 查看本地存储数据

### Chrome DevTools
1. 打开开发者工具（F12）
2. 切换到 **Application** 标签
3. 左侧选择 **Local Storage** > `http://localhost:3000`
4. 找到 `ai_writing_history` 键
5. 查看 JSON 格式的历史记录数据

### 手动清除数据
```javascript
// 在浏览器控制台执行
localStorage.removeItem('ai_writing_history');
```

## 📊 存储容量

### LocalStorage 模式
- 每个模板最多 50 条记录
- 超过限制自动删除最旧的记录
- 浏览器 localStorage 总容量约 5-10MB

### Database 模式
- 无数量限制
- 取决于数据库配置
- 建议定期清理过期数据

## 🐛 故障排查

### 问题 1: 历史记录不显示
**解决方案**:
1. 检查浏览器控制台是否有错误
2. 验证 localStorage 中是否有数据
3. 确认环境变量配置正确

### 问题 2: 切换模板后历史记录消失
**说明**: 这是正常行为，每个模板有独立的历史记录

### 问题 3: 刷新页面后历史记录丢失
**原因**: 可能是浏览器隐私模式或禁用了 localStorage
**解决方案**: 使用普通浏览模式

## 📝 开发注意事项

### 代码位置
- 存储系统：`lib/history-storage.ts`
- 页面组件：`components/xiaohongshu-writing-page.tsx`
- 环境配置：`.env.local`

### 修改存储逻辑
如需修改存储逻辑，只需编辑 `lib/history-storage.ts` 中的适配器类：
- `LocalStorageAdapter` - 本地存储逻辑
- `DatabaseAdapter` - 数据库存储逻辑

### 添加新功能
```typescript
// 在 StorageAdapter 接口中添加新方法
export interface StorageAdapter {
  // 现有方法...

  // 新方法
  searchHistory(keyword: string): Promise<HistoryItem[]>;
}

// 在两个适配器中实现
class LocalStorageAdapter implements StorageAdapter {
  async searchHistory(keyword: string): Promise<HistoryItem[]> {
    const allHistory = this.readAllHistory();
    return allHistory.filter(item =>
      item.content.includes(keyword) ||
      item.result.includes(keyword)
    );
  }
}
```

## 🎓 学习资源

- [适配器模式详解](https://refactoring.guru/design-patterns/adapter)
- [localStorage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)
- [Next.js 环境变量](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## 📞 技术支持

如有问题，请查看：
1. `DEVELOPMENT_GUIDE.md` - 完整开发文档
2. 浏览器控制台错误信息
3. 项目 Issues

---

**最后更新**: 2026-01-22
**版本**: 2.0
