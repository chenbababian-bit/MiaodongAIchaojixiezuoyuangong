# 数据库变更记录 (Database Changelog)

本文档记录所有数据库结构变更的历史、流程和最佳实践。

---

## 📋 目录

- [当前数据库结构](#当前数据库结构)
- [变更历史](#变更历史)
- [如何执行数据库变更](#如何执行数据库变更)
- [回滚方案](#回滚方案)
- [最佳实践](#最佳实践)

---

## 🗄️ 当前数据库结构

### 表：`conversations` (对话表)

**用途：** 存储用户的对话会话记录

**字段：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 对话唯一标识 |
| `user_id` | UUID | FOREIGN KEY | 用户ID，关联 auth.users(id) |
| `title` | TEXT | NOT NULL | 对话标题 |
| `type` | TEXT | NOT NULL, CHECK | 对话类型（见下方类型列表） |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 |

**支持的对话类型 (`type` 字段)：**

- `qa` - 问答对话
- `role` - 角色扮演
- `xiaohongshu-travel` - 小红书旅游攻略
- `xiaohongshu-copywriting` - 小红书爆款文案
- `xiaohongshu-title` - 小红书爆款标题
- `xiaohongshu-profile` - 小红书个人简介
- `xiaohongshu-seo` - 小红书SEO优化
- `xiaohongshu-style` - 小红书风格改写
- `xiaohongshu-product` - 小红书产品种草
- `xiaohongshu-recommendation` - 小红书好物推荐

**索引：**
- `user_id` 字段有索引，用于快速查询用户的对话列表
- `updated_at` 字段用于排序

**RLS (Row Level Security)：**
- 已启用，用户只能访问自己的对话记录

---

### 表：`messages` (消息表)

**用途：** 存储对话中的消息内容

**字段：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PRIMARY KEY | 消息唯一标识 |
| `conversation_id` | UUID | FOREIGN KEY | 对话ID，关联 conversations(id) |
| `role` | TEXT | NOT NULL | 消息角色 (user/assistant) |
| `content` | TEXT | NOT NULL | 消息内容 |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

**索引：**
- `conversation_id` 字段有索引，用于快速查询对话的所有消息

**级联删除：**
- 当对话被删除时，相关的所有消息也会被自动删除

---

## 📜 变更历史

### [2026-02-02] 添加小红书细粒度类型支持

**变更类型：** 结构变更 (Schema Change)

**变更内容：**
- 将 `conversations.type` 字段的 CHECK 约束从 2 个类型扩展到 10 个类型
- 新增 8 个小红书细粒度子类型

**影响范围：**
- `conversations` 表的 `type` 字段约束
- TypeScript 类型定义 (`lib/conversations.ts`)
- 前端组件 (`components/xiaohongshu-writing-page.tsx`)

**执行文件：**
- 新数据库：`supabase/migrations/20260202_create_conversations.sql`
- 现有数据库：`supabase/migrations/20260202_add_xiaohongshu_type.sql`

**数据迁移：**
- 如果有旧的 `xiaohongshu` 类型数据，需要手动迁移到新的细粒度类型
- 测试数据可以直接删除

**相关文档：**
- [SUPABASE_UPDATE_GUIDE.md](./SUPABASE_UPDATE_GUIDE.md) - 详细更新指南
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - 实现总结

**提交记录：**
- Commit: `f3b2813`
- 提交信息: "refactor(xiaohongshu): 将单一类型拆分为8个细粒度子类型"

---

### [初始版本] 创建对话和消息表

**变更类型：** 初始化 (Initial Setup)

**变更内容：**
- 创建 `conversations` 表
- 创建 `messages` 表
- 设置 RLS 策略
- 创建必要的索引

**执行文件：**
- `supabase/migrations/20260202_create_conversations.sql`

---

## 🔧 如何执行数据库变更

### 方法 1：通过 Supabase Dashboard（推荐）

1. **登录 Supabase Dashboard**
   ```
   https://app.supabase.com
   ```

2. **选择项目**
   - 进入你的项目

3. **打开 SQL Editor**
   - 左侧菜单 → SQL Editor

4. **执行 SQL 脚本**
   - 点击 "New query"
   - 复制对应的 SQL 文件内容
   - 粘贴到编辑器
   - 点击 "Run" 执行

5. **验证结果**
   - 检查执行结果
   - 确认没有错误信息

### 方法 2：通过 Supabase CLI

```bash
# 1. 安装 Supabase CLI（如果还没安装）
npm install -g supabase

# 2. 登录
supabase login

# 3. 链接到项目
supabase link --project-ref <your-project-ref>

# 4. 执行迁移
supabase db push

# 5. 验证
supabase db diff
```

### 方法 3：直接执行 SQL 文件

```bash
# 使用 psql 连接到数据库
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# 执行 SQL 文件
\i supabase/migrations/20260202_add_xiaohongshu_type.sql
```

---

## ⏮️ 回滚方案

### 回滚小红书细粒度类型变更

如果需要回滚到之前的版本，执行以下 SQL：

```sql
-- 删除新的 CHECK 约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

-- 恢复旧的 CHECK 约束（仅 qa 和 role）
ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN ('qa', 'role'));

-- 注意：如果已有使用新类型的数据，需要先处理这些数据
-- 方案 1：删除所有小红书类型的对话
DELETE FROM conversations WHERE type LIKE 'xiaohongshu%';

-- 方案 2：将所有小红书类型统一为 'xiaohongshu'（需要先添加此类型）
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN ('qa', 'role', 'xiaohongshu'));

UPDATE conversations
SET type = 'xiaohongshu'
WHERE type LIKE 'xiaohongshu-%';
```

---

## 📚 最佳实践

### 1. 变更前的准备

- ✅ **备份数据库**
  ```sql
  -- 导出对话表
  COPY conversations TO '/tmp/conversations_backup.csv' CSV HEADER;

  -- 导出消息表
  COPY messages TO '/tmp/messages_backup.csv' CSV HEADER;
  ```

- ✅ **在测试环境先执行**
  - 永远不要直接在生产环境执行未测试的变更

- ✅ **检查现有数据**
  ```sql
  -- 检查当前使用的类型
  SELECT type, COUNT(*) as count
  FROM conversations
  GROUP BY type;
  ```

### 2. 执行变更时

- ✅ **使用事务**
  ```sql
  BEGIN;

  -- 你的变更 SQL
  ALTER TABLE conversations ...

  -- 验证结果
  SELECT * FROM conversations LIMIT 1;

  -- 如果一切正常，提交
  COMMIT;

  -- 如果有问题，回滚
  -- ROLLBACK;
  ```

- ✅ **记录变更**
  - 在本文档中添加变更记录
  - 创建对应的 migration 文件
  - 更新相关的 TypeScript 类型定义

### 3. 变更后的验证

- ✅ **验证约束**
  ```sql
  -- 查看表的约束
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'conversations'::regclass;
  ```

- ✅ **测试插入**
  ```sql
  -- 测试插入新类型
  INSERT INTO conversations (user_id, title, type)
  VALUES (
    'test-user-id',
    '测试对话',
    'xiaohongshu-travel'
  );

  -- 清理测试数据
  DELETE FROM conversations WHERE title = '测试对话';
  ```

- ✅ **更新应用代码**
  - 更新 TypeScript 类型定义
  - 更新前端组件
  - 运行类型检查：`npx tsc --noEmit`

### 4. 文档维护

- ✅ **及时更新文档**
  - 每次数据库变更后立即更新本文档
  - 记录变更原因、影响范围、执行步骤

- ✅ **保留历史记录**
  - 不要删除旧的变更记录
  - 使用日期标记每次变更

### 5. 命名规范

- ✅ **Migration 文件命名**
  ```
  格式：YYYYMMDD_description.sql
  示例：20260202_add_xiaohongshu_type.sql
  ```

- ✅ **约束命名**
  ```
  格式：{table_name}_{column_name}_{constraint_type}
  示例：conversations_type_check
  ```

---

## 🔍 常见问题

### Q1: 如何查看当前数据库的所有表？

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

### Q2: 如何查看表的详细结构？

```sql
\d+ conversations
```

或者：

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'conversations';
```

### Q3: 如何检查是否有数据使用了旧类型？

```sql
SELECT type, COUNT(*) as count
FROM conversations
WHERE type NOT IN (
  'qa',
  'role',
  'xiaohongshu-travel',
  'xiaohongshu-copywriting',
  'xiaohongshu-title',
  'xiaohongshu-profile',
  'xiaohongshu-seo',
  'xiaohongshu-style',
  'xiaohongshu-product',
  'xiaohongshu-recommendation'
)
GROUP BY type;
```

### Q4: 如何批量更新数据类型？

```sql
-- 示例：将所有 'xiaohongshu' 类型更新为 'xiaohongshu-copywriting'
UPDATE conversations
SET type = 'xiaohongshu-copywriting'
WHERE type = 'xiaohongshu';
```

---

## 📞 联系方式

如有数据库相关问题，请：
1. 查看本文档的相关章节
2. 查看 [SUPABASE_UPDATE_GUIDE.md](./SUPABASE_UPDATE_GUIDE.md)
3. 提交 GitHub Issue

---

**最后更新：** 2026-02-02
**维护者：** 开发团队
