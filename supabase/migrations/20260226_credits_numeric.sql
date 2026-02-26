-- ============================================
-- 积分字段改为 NUMERIC(10,3)，支持3位小数
-- ============================================
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 1. 先删除余额非负约束（INTEGER 约束不兼容 NUMERIC）
ALTER TABLE user_credits DROP CONSTRAINT IF EXISTS balance_non_negative;

-- 2. 修改 user_credits 表字段类型
ALTER TABLE user_credits
  ALTER COLUMN balance TYPE NUMERIC(10,3),
  ALTER COLUMN total_earned TYPE NUMERIC(10,3),
  ALTER COLUMN total_consumed TYPE NUMERIC(10,3);

-- 3. 重新添加余额非负约束
ALTER TABLE user_credits
  ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);

-- 4. 修改 credit_transactions 表字段类型
ALTER TABLE credit_transactions
  ALTER COLUMN amount TYPE NUMERIC(10,3),
  ALTER COLUMN balance_before TYPE NUMERIC(10,3),
  ALTER COLUMN balance_after TYPE NUMERIC(10,3);

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 积分字段类型迁移完成！';
  RAISE NOTICE '已修改：';
  RAISE NOTICE '  - user_credits.balance → NUMERIC(10,3)';
  RAISE NOTICE '  - user_credits.total_earned → NUMERIC(10,3)';
  RAISE NOTICE '  - user_credits.total_consumed → NUMERIC(10,3)';
  RAISE NOTICE '  - credit_transactions.amount → NUMERIC(10,3)';
  RAISE NOTICE '  - credit_transactions.balance_before → NUMERIC(10,3)';
  RAISE NOTICE '  - credit_transactions.balance_after → NUMERIC(10,3)';
  RAISE NOTICE '';
  RAISE NOTICE '新计费规则：每千字 0.5 积分，精确到3位小数';
END $$;
