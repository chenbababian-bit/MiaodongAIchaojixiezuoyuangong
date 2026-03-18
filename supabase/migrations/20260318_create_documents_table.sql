-- ============================================
-- 用户文档管理表
-- ============================================
-- 此脚本创建用户文档表，用于存储AI生成的文档内容
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 1. 创建 user_documents 表
CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 文档基本信息
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- 模板相关
  template_id INTEGER,
  template_name TEXT,
  template_category TEXT,

  -- 统计信息
  word_count INTEGER DEFAULT 0,
  credits_consumed NUMERIC(10,3) DEFAULT 0,

  -- 用户操作
  is_favorite BOOLEAN DEFAULT false,

  -- 时间戳
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_created_at ON user_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_documents_template_category ON user_documents(template_category);
CREATE INDEX IF NOT EXISTS idx_user_documents_is_favorite ON user_documents(is_favorite);

-- 3. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器
CREATE TRIGGER update_user_documents_updated_at
  BEFORE UPDATE ON user_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- 5. 启用行级安全策略 (RLS)
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- 6. 创建 RLS 策略
-- 用户只能查看自己的文档
CREATE POLICY "用户只能查看自己的文档"
  ON user_documents FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的文档
CREATE POLICY "用户只能创建自己的文档"
  ON user_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的文档
CREATE POLICY "用户只能更新自己的文档"
  ON user_documents FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的文档
CREATE POLICY "用户只能删除自己的文档"
  ON user_documents FOR DELETE
  USING (auth.uid() = user_id);

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 用户文档表创建完成！';
  RAISE NOTICE '已创建：';
  RAISE NOTICE '  - user_documents 表（用户文档）';
  RAISE NOTICE '  - 所有必要的索引';
  RAISE NOTICE '  - RLS 策略';
  RAISE NOTICE '  - 触发器和函数';
END $$;
