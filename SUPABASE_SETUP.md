# Supabase 配置指南

本指南将帮助您完成 Supabase 的配置，以启用对话历史记录功能。

## 📋 配置步骤

### 步骤 1：获取 Supabase 项目信息

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 点击左侧菜单的 **Settings** (设置)
4. 点击 **API** 选项卡
5. 复制以下信息：
   - **Project URL** (项目URL)
   - **anon public** key (匿名公钥)

### 步骤 2：配置环境变量

1. 打开项目根目录的 `.env.local` 文件
2. 填写 Supabase 配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**注意：** 将 `your-project-id` 和 `your-anon-key-here` 替换为您在步骤1中复制的实际值。

### 步骤 3：创建数据库表

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query** 创建新查询
3. 打开项目中的文件：`supabase/migrations/20260202_create_conversations.sql`
4. 复制整个文件内容
5. 粘贴到 SQL Editor 中
6. 点击 **Run** 按钮执行

**执行成功后，您会看到：**
- ✅ conversations 表已创建
- ✅ messages 表已创建
- ✅ 索引已创建
- ✅ RLS 策略已启用
- ✅ 触发器已创建

### 步骤 4：配置 Google OAuth 登录（必需）

由于对话历史记录功能需要用户登录，您需要配置 Google OAuth：

#### 4.1 在 Google Cloud Console 配置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 **Google+ API**
4. 创建 OAuth 2.0 凭据：
   - 应用类型：Web 应用
   - 授权重定向 URI：`https://your-project-id.supabase.co/auth/v1/callback`
5. 复制 **客户端 ID** 和 **客户端密钥**

#### 4.2 在 Supabase 配置 Google OAuth

1. 在 Supabase Dashboard 中，点击 **Authentication** (认证)
2. 点击 **Providers** (提供商)
3. 找到 **Google** 并点击
4. 启用 Google 提供商
5. 填写：
   - **Client ID**：从 Google Cloud Console 复制的客户端 ID
   - **Client Secret**：从 Google Cloud Console 复制的客户端密钥
6. 点击 **Save** 保存

### 步骤 5：验证配置

#### 5.1 检查数据库表

在 SQL Editor 中运行：

```sql
-- 检查表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('conversations', 'messages');
```

应该看到两个表都存在，且 `rowsecurity` 为 `true`。

#### 5.2 测试应用

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问应用并尝试：
   - 使用 Google 账号登录
   - 点击"新建会话"
   - 发送消息
   - 刷新页面，检查对话是否保存

## 🔍 常见问题

### Q1: 提示"请先登录"

**原因：** 用户未登录或 Google OAuth 未配置

**解决方案：**
1. 确保已完成步骤 4 的 Google OAuth 配置
2. 检查 Supabase Dashboard > Authentication > Users 是否有用户
3. 尝试重新登录

### Q2: 对话无法保存

**原因：** 数据库表未创建或 RLS 策略有问题

**解决方案：**
1. 检查步骤 3 的 SQL 是否执行成功
2. 在 Supabase Dashboard > Table Editor 中查看是否有 `conversations` 和 `messages` 表
3. 检查浏览器控制台是否有错误信息

### Q3: 环境变量不生效

**原因：** 环境变量未正确配置或服务器未重启

**解决方案：**
1. 确保 `.env.local` 文件在项目根目录
2. 检查环境变量名称是否正确（必须以 `NEXT_PUBLIC_` 开头）
3. 重启开发服务器

### Q4: RLS 策略错误

**原因：** 用户 ID 不匹配或策略配置错误

**解决方案：**
1. 在 SQL Editor 中运行：
   ```sql
   -- 检查当前用户
   SELECT auth.uid();
   ```
2. 确保返回的 UUID 与 conversations 表中的 user_id 匹配

## 📊 数据库结构

### conversations 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（关联 auth.users） |
| title | TEXT | 对话标题 |
| type | TEXT | 对话类型（'qa' 或 'role'） |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### messages 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| conversation_id | UUID | 对话ID（关联 conversations） |
| role | TEXT | 角色（'user' 或 'assistant'） |
| content | TEXT | 消息内容 |
| created_at | TIMESTAMPTZ | 创建时间 |

## 🔒 安全说明

- ✅ 所有表都启用了行级安全策略（RLS）
- ✅ 用户只能访问自己的数据
- ✅ 删除对话会自动级联删除相关消息
- ✅ API 密钥使用 `anon` 级别，安全性高

## 📝 下一步

配置完成后，您可以：
1. 开始使用对话历史记录功能
2. 查看 Supabase Dashboard > Table Editor 中的数据
3. 在 Authentication > Users 中管理用户

如有问题，请查看：
- Supabase 文档：https://supabase.com/docs
- 项目 README.md
