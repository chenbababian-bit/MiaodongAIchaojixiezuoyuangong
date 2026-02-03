-- ============================================
-- [变更标题]
-- ============================================
-- 变更描述：
--   [详细描述这次变更的目的和内容]
--
-- 变更日期：YYYY-MM-DD
-- 变更类型：[结构变更/数据迁移/索引优化/约束修改]
-- 影响范围：[列出受影响的表和字段]
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
--
-- 回滚方案：
--   [描述如何回滚这次变更]
-- ============================================

-- 开始事务（可选，但推荐）
BEGIN;

-- ============================================
-- 变更 SQL
-- ============================================

-- [在这里编写你的 SQL 变更语句]

-- 示例：添加新列
-- ALTER TABLE table_name
-- ADD COLUMN new_column_name data_type constraints;

-- 示例：修改约束
-- ALTER TABLE table_name
-- DROP CONSTRAINT IF EXISTS old_constraint_name;
--
-- ALTER TABLE table_name
-- ADD CONSTRAINT new_constraint_name
-- CHECK (condition);

-- 示例：创建索引
-- CREATE INDEX IF NOT EXISTS index_name
-- ON table_name (column_name);

-- 示例：数据迁移
-- UPDATE table_name
-- SET column_name = new_value
-- WHERE condition;

-- ============================================
-- 验证变更
-- ============================================

-- [在这里编写验证 SQL，确保变更成功]

-- 示例：检查新列是否存在
-- SELECT column_name
-- FROM information_schema.columns
-- WHERE table_name = 'your_table_name'
--   AND column_name = 'new_column_name';

-- 示例：检查约束是否正确
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'your_table_name'::regclass;

-- ============================================
-- 完成提示
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ [变更标题] 执行成功！';
  RAISE NOTICE '变更内容：';
  RAISE NOTICE '  - [变更点1]';
  RAISE NOTICE '  - [变更点2]';
  RAISE NOTICE '  - [变更点3]';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  注意事项：';
  RAISE NOTICE '  - [注意事项1]';
  RAISE NOTICE '  - [注意事项2]';
END $$;

-- 提交事务（如果使用了 BEGIN）
COMMIT;

-- 如果需要回滚，执行：
-- ROLLBACK;

-- ============================================
-- 回滚脚本（保留在注释中）
-- ============================================

-- BEGIN;
--
-- [在这里编写回滚 SQL]
--
-- 示例：删除新列
-- ALTER TABLE table_name
-- DROP COLUMN IF EXISTS new_column_name;
--
-- 示例：恢复旧约束
-- ALTER TABLE table_name
-- DROP CONSTRAINT IF EXISTS new_constraint_name;
--
-- ALTER TABLE table_name
-- ADD CONSTRAINT old_constraint_name
-- CHECK (old_condition);
--
-- COMMIT;
