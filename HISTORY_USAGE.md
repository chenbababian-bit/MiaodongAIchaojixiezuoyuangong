# 历史记录功能使用指南

## 🎯 功能概述

历史记录功能支持两种存储模式：
- **本地存储模式**：数据保存在浏览器 localStorage（适合测试）
- **数据库模式**：数据保存在 Supabase 云端数据库（适合生产环境）

## 🔐 安全特性

### 登录保护
- ✅ **必须登录才能使用**：未登录用户无法访问应用功能
- ✅ **账号隔离**：不同账号拥有独立的历史记录
- ✅ **数据安全**：使用 Supabase RLS 策略保护数据

### 访问控制
- 未登录访问受保护页面 → 自动跳转到登录页
- 已登录访问登录页 → 自动跳转到首页
- 受保护的路由：`/apps`, `/chat`, `/longtext`, `/xiaohongshu`, `/profile`

## 🚀 快速开始

### 1. 本地测试（使用 localStorage）

```bash
# 1. 确保环境变量配置
# .env.local 中设置：
NEXT_PUBLIC_USE_DATABASE=false

# 2. 启动开发服务器
npm run dev

# 3. 访问 http://localhost:3000
# 4. 使用 Google 账号登录
# 5. 开始使用，历史记录会自动保存到浏览器
```

### 2. 生产环境（使用数据库）

```bash
# 1. 在 Supabase 中创建数据库表（参考 DATABASE_SETUP.md）

# 2. 配置环境变量
# .env.local 中设置：
NEXT_PUBLIC_USE_DATABASE=true
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 3. 启动应用
npm run dev

# 4. 登录后，历史记录会自动保存到数据库
```

## 📝 功能说明

### 自动保存
- 每次生成内容后，自动保存到历史记录
- 每个模板最多保存 50 条记录（超出后自动删除最旧的）

### 查看历史
- 点击"历史记录"按钮查看该模板的所有历史记录
- 按时间倒序排列（最新的在最前面）

### 删除记录
- 单条删除：点击记录旁的删除按钮
- 批量清空：点击"清空历史"按钮

### 数据隔离
- 每个用户只能看到自己的历史记录
- 不同模板的历史记录独立存储

## 🔄 切换存储模式

### 从本地存储切换到数据库

1. 完成数据库设置（参考 [DATABASE_SETUP.md](DATABASE_SETUP.md)）
2. 修改 `.env.local`：
   ```bash
   NEXT_PUBLIC_USE_DATABASE=true
   ```
3. 重启应用

**注意**：旧的 localStorage 数据不会自动迁移

### 从数据库切换到本地存储

1. 修改 `.env.local`：
   ```bash
   NEXT_PUBLIC_USE_DATABASE=false
   ```
2. 重启应用

## 🛠️ 技术实现

### 架构设计
- **适配器模式**：统一的存储接口，支持多种存储方式
- **自动切换**：根据环境变量自动选择存储方式
- **类型安全**：完整的 TypeScript 类型定义

### 文件结构
```
lib/
  ├── history-storage.ts      # 历史记录存储管理器
  └── supabase.ts             # Supabase 客户端配置

app/api/history/
  ├── route.ts                # 获取/添加历史记录
  ├── [id]/route.ts           # 删除单条记录
  └── clear/route.ts          # 清空历史记录

middleware.ts                 # 登录验证中间件
```

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/history` | 获取历史记录 |
| GET | `/api/history?templateId=xxx` | 获取指定模板的历史记录 |
| POST | `/api/history` | 添加历史记录 |
| DELETE | `/api/history/[id]` | 删除单条记录 |
| POST | `/api/history/clear` | 清空指定模板的历史记录 |

## 📊 数据结构

```typescript
interface HistoryItem {
  id: number              // 记录ID
  templateId: string      // 模板ID
  templateTitle: string   // 模板标题
  content: string         // 用户输入
  result: string          // AI生成结果
  timestamp: Date         // 创建时间
}
```

## 🔍 调试技巧

### 查看当前存储模式
打开浏览器控制台，查看日志：
- `💾 使用本地存储历史记录` → 本地存储模式
- `📊 使用数据库存储历史记录` → 数据库模式

### 查看 localStorage 数据
```javascript
// 在浏览器控制台执行
localStorage.getItem('ai_writing_history')
```

### 查看数据库数据
在 Supabase Dashboard 中：
1. 导航到 **Table Editor**
2. 选择 `writing_history` 表
3. 查看数据

### 常见问题排查

**问题：历史记录没有保存**
- 检查是否已登录
- 检查浏览器控制台是否有错误
- 检查环境变量配置是否正确

**问题：看不到历史记录**
- 确认使用的是同一个账号
- 检查模板ID是否正确
- 查看网络请求是否成功

**问题：数据库连接失败**
- 检查 Supabase 配置是否正确
- 检查网络连接
- 查看 Supabase Dashboard 的日志

## 📚 相关文档

- [数据库设置指南](DATABASE_SETUP.md) - 详细的数据库配置步骤
- [环境变量配置](.env.example) - 环境变量模板
- [Supabase 文档](https://supabase.com/docs) - Supabase 官方文档

## 🎉 总结

历史记录功能已完全集成到应用中，具备以下特点：

✅ **安全可靠**：登录保护 + 数据隔离
✅ **灵活切换**：支持本地存储和数据库两种模式
✅ **自动管理**：自动保存、自动清理旧数据
✅ **易于使用**：无需额外配置，开箱即用

现在你可以放心使用历史记录功能了！🚀
