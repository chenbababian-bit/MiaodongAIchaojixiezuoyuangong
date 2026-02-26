-- ============================================
-- 用户积分系统数据库表
-- ============================================
-- 此脚本创建用户积分和交易记录表，用于实现计量+扣费功能
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 1. 创建 user_credits 表（用户积分余额表）
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_consumed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 确保余额非负
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- 2. 创建 credit_transactions 表（积分交易记录表）
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 交易类型
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'consumption',
    'recharge',
    'gift',
    'refund',
    'adjustment'
  )),

  -- 积分变动
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,

  -- AI生成相关（仅consumption类型使用）
  template_id INTEGER,
  template_name TEXT,
  word_count INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,

  -- 元数据
  description TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON user_credits(balance);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_template_id ON credit_transactions(template_id);

-- 4. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_credits_updated_at();

-- 6. 启用行级安全策略 (RLS)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 7. 创建 RLS 策略 - user_credits 表
-- 用户只能查看自己的积分
CREATE POLICY "用户只能查看自己的积分"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的积分记录
CREATE POLICY "用户只能创建自己的积分记录"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的积分
CREATE POLICY "用户只能更新自己的积分"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. 创建 RLS 策略 - credit_transactions 表
-- 用户只能查看自己的交易记录
CREATE POLICY "用户只能查看自己的交易记录"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的交易记录
CREATE POLICY "用户只能创建自己的交易记录"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 用户积分系统数据库创建完成！';
  RAISE NOTICE '已创建：';
  RAISE NOTICE '  - user_credits 表（用户积分余额）';
  RAISE NOTICE '  - credit_transactions 表（积分交易记录）';
  RAISE NOTICE '  - 所有必要的索引';
  RAISE NOTICE '  - RLS 策略';
  RAISE NOTICE '  - 触发器和函数';
  RAISE NOTICE '';
  RAISE NOTICE '积分计费规则：';
  RAISE NOTICE '  - 新用户默认获得 10 积分';
  RAISE NOTICE '  - 每1000字消耗 0.5 积分（即每2000字消耗1积分）';
  RAISE NOTICE '  - 最低消费 1 积分';
END $$;
