# 数据库设置指南

本文档说明如何在 Supabase 中设置历史记录数据库。

## 📋 前提条件

1. 已注册 [Supabase](https://supabase.com) 账号
2. 已创建 Supabase 项目
3. 已配置 Google OAuth 登录（参考 [认证设置](#认证设置)）

## 🗄️ 数据库表结构

### 1. 创建历史记录表

在 Supabase Dashboard 中，进入 **SQL Editor**，执行以下 SQL：

```sql
-- 创建历史记录表
CREATE TABLE writing_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  template_title TEXT NOT NULL,
  content TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_writing_history_user_id ON writing_history(user_id);
CREATE INDEX idx_writing_history_template_id ON writing_history(template_id);
CREATE INDEX idx_writing_history_user_template ON writing_history(user_id, template_id);
CREATE INDEX idx_writing_history_created_at ON writing_history(created_at DESC);

-- 启用行级安全策略 (RLS)
ALTER TABLE writing_history ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能查看自己的历史记录
CREATE POLICY "用户只能查看自己的历史记录"
  ON writing_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建RLS策略：用户只能插入自己的历史记录
CREATE POLICY "用户只能创建自己的历史记录"
  ON writing_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 创建RLS策略：用户只能删除自己的历史记录
CREATE POLICY "用户只能删除自己的历史记录"
  ON writing_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- 创建RLS策略：用户只能更新自己的历史记录
CREATE POLICY "用户只能更新自己的历史记录"
  ON writing_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_writing_history_updated_at
  BEFORE UPDATE ON writing_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. 表结构说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | BIGSERIAL | 主键，自增ID |
| `user_id` | UUID | 用户ID，关联到 `auth.users` 表 |
| `template_id` | TEXT | 模板ID（如 "xiaohongshu"） |
| `template_title` | TEXT | 模板标题 |
| `content` | TEXT | 用户输入的内容 |
| `result` | TEXT | AI生成的结果 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

### 3. 安全特性

- **行级安全策略（RLS）**：确保用户只能访问自己的数据
- **外键约束**：用户删除时自动清理历史记录
- **索引优化**：提高查询性能
- **自动时间戳**：自动更新 `updated_at` 字段

## 🔐 认证设置

### 配置 Google OAuth

1. 进入 Supabase Dashboard
2. 导航到 **Authentication** > **Providers**
3. 启用 **Google** 提供商
4. 配置 Google OAuth 凭据：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建 OAuth 2.0 客户端 ID
   - 设置授权重定向 URI：`https://<your-project-ref>.supabase.co/auth/v1/callback`
   - 复制 Client ID 和 Client Secret 到 Supabase

## ⚙️ 环境变量配置

在项目根目录的 `.env.local` 文件中配置：

```bash
# 启用数据库存储
NEXT_PUBLIC_USE_DATABASE=true

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 获取 Supabase 配置

1. 进入 Supabase Dashboard
2. 导航到 **Settings** > **API**
3. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 测试数据库连接

### 1. 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 使用 Google 账号登录
# 尝试生成内容并查看历史记录
```

### 2. 验证数据

在 Supabase Dashboard 中：

1. 导航到 **Table Editor**
2. 选择 `writing_history` 表
3. 查看是否有新记录插入

### 3. 检查 RLS 策略

```sql
-- 在 SQL Editor 中执行
SELECT * FROM writing_history;
-- 应该只能看到当前登录用户的记录
```

## 🔄 从本地存储迁移到数据库

如果你之前使用的是本地存储（localStorage），切换到数据库后：

1. **旧数据不会自动迁移**：localStorage 中的历史记录不会自动同步到数据库
2. **新数据存储在数据库**：切换后，所有新的历史记录都会保存到数据库
3. **手动迁移**（可选）：如果需要保留旧数据，可以：
   - 导出 localStorage 数据
   - 通过 API 批量导入到数据库

## 📊 数据库维护

### 清理旧数据

系统会自动限制每个用户每个模板最多保存 50 条历史记录。如需调整：

修改 [app/api/history/route.ts](app/api/history/route.ts:115)：

```typescript
if (count && count > 50) {  // 修改这个数字
  // ...
}
```

### 备份数据

在 Supabase Dashboard 中：

1. 导航到 **Database** > **Backups**
2. 配置自动备份策略
3. 或手动创建备份

## 🚀 部署到生产环境

### Vercel 部署

在 Vercel Dashboard 中配置环境变量：

```
NEXT_PUBLIC_USE_DATABASE=true
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 安全检查清单

- [ ] 已启用 RLS 策略
- [ ] 已配置 Google OAuth
- [ ] 已设置环境变量
- [ ] 已测试登录流程
- [ ] 已测试历史记录 CRUD 操作
- [ ] 已配置数据库备份

## ❓ 常见问题

### Q: 为什么我看不到其他用户的历史记录？

A: 这是正常的。RLS 策略确保每个用户只能看到自己的数据，这是安全设计。

### Q: 如何切换回本地存储？

A: 将 `.env.local` 中的 `NEXT_PUBLIC_USE_DATABASE` 设置为 `false` 或删除该行。

### Q: 数据库连接失败怎么办？

A: 检查以下几点：
1. Supabase URL 和 API Key 是否正确
2. 网络连接是否正常
3. Supabase 项目是否处于活跃状态
4. 浏览器控制台是否有错误信息

### Q: 如何查看 API 请求日志？

A: 在 Supabase Dashboard 中：
1. 导航到 **Logs** > **API**
2. 查看最近的请求和响应

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Google OAuth 配置](https://supabase.com/docs/guides/auth/social-login/auth-google)
