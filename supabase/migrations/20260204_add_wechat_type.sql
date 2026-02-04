-- ============================================
-- 添加公众号细粒度类型支持
-- ============================================
-- 此脚本用于更新已存在的 conversations 表，添加公众号细粒度类型支持
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 删除旧的 CHECK 约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

-- 添加新的 CHECK 约束，包含所有小红书和公众号细粒度类型
ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN (
  'qa',
  'role',
  'xiaohongshu-travel',
  'xiaohongshu-copywriting',
  'xiaohongshu-title',
  'xiaohongshu-profile',
  'xiaohongshu-seo',
  'xiaohongshu-style',
  'xiaohongshu-product',
  'xiaohongshu-recommendation',
  'wechat-article',
  'wechat-continue',
  'wechat-title',
  'wechat-clickbait'
));

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 成功添加公众号细粒度类型支持！';
  RAISE NOTICE '现在 conversations 表的 type 字段支持以下值：';
  RAISE NOTICE '  - qa (问答对话)';
  RAISE NOTICE '  - role (角色扮演)';
  RAISE NOTICE '  - xiaohongshu-travel (小红书-旅游攻略)';
  RAISE NOTICE '  - xiaohongshu-copywriting (小红书-爆款文案)';
  RAISE NOTICE '  - xiaohongshu-title (小红书-爆款标题)';
  RAISE NOTICE '  - xiaohongshu-profile (小红书-个人简介)';
  RAISE NOTICE '  - xiaohongshu-seo (小红书-SEO优化)';
  RAISE NOTICE '  - xiaohongshu-style (小红书-风格改写)';
  RAISE NOTICE '  - xiaohongshu-product (小红书-产品种草)';
  RAISE NOTICE '  - xiaohongshu-recommendation (小红书-好物推荐)';
  RAISE NOTICE '  - wechat-article (公众号-文章撰写)';
  RAISE NOTICE '  - wechat-continue (公众号-文本续写)';
  RAISE NOTICE '  - wechat-title (公众号-标题)';
  RAISE NOTICE '  - wechat-clickbait (公众号-标题党)';
END $$;
