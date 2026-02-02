-- ============================================
-- 对话历史记录数据库表
-- ============================================
-- 此脚本创建对话和消息表，用于存储用户的对话历史
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 1. 创建 conversations 表（对话表）
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
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
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 创建 messages 表（消息表）
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 4. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- 6. 启用行级安全策略 (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 7. 创建 RLS 策略 - conversations 表
-- 用户只能查看自己的对话
CREATE POLICY "用户只能查看自己的对话"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

-- 用户只能创建自己的对话
CREATE POLICY "用户只能创建自己的对话"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的对话
CREATE POLICY "用户只能更新自己的对话"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能删除自己的对话
CREATE POLICY "用户只能删除自己的对话"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- 8. 创建 RLS 策略 - messages 表
-- 用户只能查看自己对话中的消息
CREATE POLICY "用户只能查看自己对话中的消息"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- 用户只能创建自己对话中的消息
CREATE POLICY "用户只能创建自己对话中的消息"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- 用户只能更新自己对话中的消息
CREATE POLICY "用户只能更新自己对话中的消息"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- 用户只能删除自己对话中的消息
CREATE POLICY "用户只能删除自己对话中的消息"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '对话历史记录数据库创建完成！';
  RAISE NOTICE '已创建：';
  RAISE NOTICE '  - conversations 表（对话表）';
  RAISE NOTICE '  - messages 表（消息表）';
  RAISE NOTICE '  - 所有必要的索引';
  RAISE NOTICE '  - RLS 策略';
  RAISE NOTICE '  - 触发器和函数';
END $$;
