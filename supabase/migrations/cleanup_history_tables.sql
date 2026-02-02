-- ============================================
-- 历史记录数据库清理脚本
-- ============================================
-- 此脚本用于完全删除历史记录相关的数据库表和策略
--
-- 警告：此操作不可逆！执行前请确保已备份重要数据
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 1. 删除触发器
DROP TRIGGER IF EXISTS update_writing_history_updated_at ON writing_history;

-- 2. 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. 删除 RLS 策略
DROP POLICY IF EXISTS "用户只能查看自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "用户只能创建自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "用户只能删除自己的历史记录" ON writing_history;
DROP POLICY IF EXISTS "用户只能更新自己的历史记录" ON writing_history;

-- 4. 删除索引
DROP INDEX IF EXISTS idx_writing_history_user_id;
DROP INDEX IF EXISTS idx_writing_history_template_id;
DROP INDEX IF EXISTS idx_writing_history_user_template;
DROP INDEX IF EXISTS idx_writing_history_created_at;

-- 5. 删除表（CASCADE 会自动删除所有依赖）
DROP TABLE IF EXISTS writing_history CASCADE;

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '历史记录数据库清理完成！';
  RAISE NOTICE '已删除：';
  RAISE NOTICE '  - writing_history 表';
  RAISE NOTICE '  - 所有相关索引';
  RAISE NOTICE '  - 所有 RLS 策略';
  RAISE NOTICE '  - 所有触发器和函数';
END $$;
