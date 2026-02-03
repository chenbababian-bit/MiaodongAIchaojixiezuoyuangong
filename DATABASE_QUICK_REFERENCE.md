# 数据库快速参考指南

本文档提供常用的数据库操作命令和查询，方便快速查找和使用。

---

## 📋 目录

- [连接数据库](#连接数据库)
- [查看数据库结构](#查看数据库结构)
- [数据查询](#数据查询)
- [数据修改](#数据修改)
- [约束管理](#约束管理)
- [索引管理](#索引管理)
- [备份与恢复](#备份与恢复)
- [性能优化](#性能优化)

---

## 🔌 连接数据库

### 通过 Supabase Dashboard
```
1. 访问 https://app.supabase.com
2. 选择项目
3. 左侧菜单 → SQL Editor
```

### 通过 psql
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

### 获取连接信息
```
Supabase Dashboard → Settings → Database → Connection string
```

---

## 🔍 查看数据库结构

### 查看所有表
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 查看表结构
```sql
-- 方法 1：使用 psql 命令
\d+ conversations

-- 方法 2：使用 SQL 查询
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;
```

### 查看表的约束
```sql
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'conversations'::regclass;
```

### 查看表的索引
```sql
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversations';
```

### 查看表的大小
```sql
SELECT
  pg_size_pretty(pg_total_relation_size('conversations')) AS total_size,
  pg_size_pretty(pg_relation_size('conversations')) AS table_size,
  pg_size_pretty(pg_total_relation_size('conversations') - pg_relation_size('conversations')) AS indexes_size;
```

---

## 📊 数据查询

### 查看对话类型分布
```sql
SELECT
  type,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM conversations
GROUP BY type
ORDER BY count DESC;
```

### 查看用户的对话数量
```sql
SELECT
  user_id,
  COUNT(*) AS conversation_count,
  MAX(updated_at) AS last_activity
FROM conversations
GROUP BY user_id
ORDER BY conversation_count DESC
LIMIT 10;
```

### 查看最近的对话
```sql
SELECT
  id,
  title,
  type,
  created_at,
  updated_at
FROM conversations
ORDER BY updated_at DESC
LIMIT 20;
```

### 查看对话及其消息数量
```sql
SELECT
  c.id,
  c.title,
  c.type,
  COUNT(m.id) AS message_count,
  c.created_at
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, c.title, c.type, c.created_at
ORDER BY c.updated_at DESC
LIMIT 20;
```

### 查找包含特定关键词的对话
```sql
SELECT DISTINCT
  c.id,
  c.title,
  c.type,
  c.created_at
FROM conversations c
JOIN messages m ON c.id = m.conversation_id
WHERE m.content ILIKE '%关键词%'
ORDER BY c.updated_at DESC;
```

### 统计每天的对话创建数量
```sql
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS conversation_count
FROM conversations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## ✏️ 数据修改

### 更新对话标题
```sql
UPDATE conversations
SET
  title = '新标题',
  updated_at = NOW()
WHERE id = 'conversation-id';
```

### 批量更新对话类型
```sql
UPDATE conversations
SET
  type = 'xiaohongshu-copywriting',
  updated_at = NOW()
WHERE type = 'xiaohongshu';
```

### 删除特定用户的所有对话
```sql
-- 注意：这会级联删除所有相关消息
DELETE FROM conversations
WHERE user_id = 'user-id';
```

### 删除超过30天的对话
```sql
DELETE FROM conversations
WHERE created_at < NOW() - INTERVAL '30 days';
```

### 清空表（保留结构）
```sql
TRUNCATE TABLE conversations CASCADE;
```

---

## 🔒 约束管理

### 添加 CHECK 约束
```sql
ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN ('qa', 'role', 'xiaohongshu-travel'));
```

### 删除约束
```sql
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;
```

### 添加外键约束
```sql
ALTER TABLE messages
ADD CONSTRAINT messages_conversation_id_fkey
FOREIGN KEY (conversation_id)
REFERENCES conversations(id)
ON DELETE CASCADE;
```

### 添加唯一约束
```sql
ALTER TABLE conversations
ADD CONSTRAINT conversations_unique_title_per_user
UNIQUE (user_id, title);
```

### 添加非空约束
```sql
ALTER TABLE conversations
ALTER COLUMN title SET NOT NULL;
```

---

## 📇 索引管理

### 创建索引
```sql
-- 单列索引
CREATE INDEX idx_conversations_user_id
ON conversations(user_id);

-- 多列索引
CREATE INDEX idx_conversations_user_type
ON conversations(user_id, type);

-- 部分索引
CREATE INDEX idx_conversations_recent
ON conversations(updated_at)
WHERE updated_at > NOW() - INTERVAL '30 days';
```

### 删除索引
```sql
DROP INDEX IF EXISTS idx_conversations_user_id;
```

### 查看索引使用情况
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  idx_tup_read AS tuples_read,
  idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'conversations'
ORDER BY idx_scan DESC;
```

### 查找未使用的索引
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;
```

---

## 💾 备份与恢复

### 导出表数据（CSV）
```sql
-- 导出到服务器文件系统
COPY conversations TO '/tmp/conversations_backup.csv' CSV HEADER;

-- 导出查询结果
COPY (
  SELECT * FROM conversations
  WHERE created_at >= '2026-01-01'
) TO '/tmp/conversations_2026.csv' CSV HEADER;
```

### 导入表数据（CSV）
```sql
COPY conversations FROM '/tmp/conversations_backup.csv' CSV HEADER;
```

### 使用 pg_dump 备份
```bash
# 备份整个数据库
pg_dump -h [HOST] -U postgres -d postgres > backup.sql

# 仅备份特定表
pg_dump -h [HOST] -U postgres -d postgres -t conversations -t messages > tables_backup.sql

# 仅备份数据（不包含结构）
pg_dump -h [HOST] -U postgres -d postgres --data-only > data_backup.sql
```

### 恢复数据库
```bash
psql -h [HOST] -U postgres -d postgres < backup.sql
```

---

## ⚡ 性能优化

### 分析表统计信息
```sql
ANALYZE conversations;
```

### 查看慢查询
```sql
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 查看表膨胀
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS live_tuples,
  n_dead_tup AS dead_tuples,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY dead_percentage DESC;
```

### 清理死元组
```sql
VACUUM ANALYZE conversations;
```

### 查看锁等待
```sql
SELECT
  pid,
  usename,
  pg_blocking_pids(pid) AS blocked_by,
  query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;
```

---

## 🛠️ 常用维护命令

### 查看数据库大小
```sql
SELECT
  pg_database.datname,
  pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;
```

### 查看活动连接
```sql
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  query
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start DESC;
```

### 终止长时间运行的查询
```sql
-- 查看长时间运行的查询
SELECT
  pid,
  now() - query_start AS duration,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND now() - query_start > interval '5 minutes'
ORDER BY duration DESC;

-- 终止特定查询
SELECT pg_terminate_backend(pid);
```

### 重建索引
```sql
REINDEX TABLE conversations;
```

---

## 📝 事务管理

### 开始事务
```sql
BEGIN;
```

### 提交事务
```sql
COMMIT;
```

### 回滚事务
```sql
ROLLBACK;
```

### 保存点
```sql
BEGIN;

-- 执行一些操作
INSERT INTO conversations ...;

-- 创建保存点
SAVEPOINT my_savepoint;

-- 执行更多操作
UPDATE conversations ...;

-- 如果需要，回滚到保存点
ROLLBACK TO SAVEPOINT my_savepoint;

-- 或者提交所有更改
COMMIT;
```

---

## 🔐 权限管理

### 查看表权限
```sql
SELECT
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'conversations';
```

### 授予权限
```sql
GRANT SELECT, INSERT, UPDATE, DELETE
ON conversations
TO authenticated;
```

### 撤销权限
```sql
REVOKE ALL PRIVILEGES
ON conversations
FROM authenticated;
```

---

## 📞 获取帮助

### PostgreSQL 官方文档
- https://www.postgresql.org/docs/

### Supabase 文档
- https://supabase.com/docs

### 查看 psql 命令帮助
```
\?        -- 查看所有 psql 命令
\h        -- 查看 SQL 命令帮助
\h ALTER  -- 查看特定 SQL 命令的帮助
```

---

**最后更新：** 2026-02-02
**相关文档：** [DATABASE_CHANGELOG.md](./DATABASE_CHANGELOG.md)
