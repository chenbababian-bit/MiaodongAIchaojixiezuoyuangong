-- 添加 conversations 字段到 writing_history 表
-- 用于存储完整的对话记录

-- 添加 conversations 字段（JSONB类型，可选）
ALTER TABLE writing_history
ADD COLUMN IF NOT EXISTS conversations JSONB;

-- 添加注释说明
COMMENT ON COLUMN writing_history.conversations IS '完整对话记录，格式: [{"role": "user"|"assistant", "content": "...", "timestamp": "..."}]';

-- 创建索引以提高查询性能（可选）
CREATE INDEX IF NOT EXISTS idx_writing_history_conversations
ON writing_history USING GIN (conversations);
