-- ============================================
-- 添加知乎细粒度类型支持
-- ============================================
-- 此脚本用于更新已存在的 conversations 表，添加知乎细粒度类型支持
--
-- 使用方法：
-- 1. 在 Supabase Dashboard 中打开 SQL Editor
-- 2. 复制并粘贴此脚本
-- 3. 点击 "Run" 执行
-- ============================================

-- 删除旧的 CHECK 约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

-- 添加新的 CHECK 约束，包含所有平台的细粒度类型
ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN (
  'qa',
  'role',
  -- 小红书类型
  'xiaohongshu-travel',
  'xiaohongshu-copywriting',
  'xiaohongshu-title',
  'xiaohongshu-profile',
  'xiaohongshu-seo',
  'xiaohongshu-style',
  'xiaohongshu-product',
  'xiaohongshu-recommendation',
  -- 公众号类型
  'wechat-article',
  'wechat-continue',
  'wechat-title',
  'wechat-clickbait',
  -- 今日头条类型
  'toutiao-article',
  'toutiao-title',
  'toutiao-qa',
  'toutiao-micro',
  'toutiao-outline',
  -- 微博类型
  'weibo-short',
  'weibo-long',
  'weibo-title',
  'weibo-name',
  'weibo-hotspot',
  'weibo-profile',
  'weibo-post',
  -- 知乎类型
  'zhihu-qa',
  'zhihu-answer',
  'zhihu-bio',
  'zhihu-tagline',
  'zhihu-username'
));

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 成功添加知乎细粒度类型支持！';
  RAISE NOTICE '现在 conversations 表的 type 字段支持以下值：';
  RAISE NOTICE '  - qa (问答对话)';
  RAISE NOTICE '  - role (角色扮演)';
  RAISE NOTICE '  【小红书】';
  RAISE NOTICE '  - xiaohongshu-travel (小红书-旅游攻略)';
  RAISE NOTICE '  - xiaohongshu-copywriting (小红书-爆款文案)';
  RAISE NOTICE '  - xiaohongshu-title (小红书-爆款标题)';
  RAISE NOTICE '  - xiaohongshu-profile (小红书-个人简介)';
  RAISE NOTICE '  - xiaohongshu-seo (小红书-SEO优化)';
  RAISE NOTICE '  - xiaohongshu-style (小红书-风格改写)';
  RAISE NOTICE '  - xiaohongshu-product (小红书-产品种草)';
  RAISE NOTICE '  - xiaohongshu-recommendation (小红书-好物推荐)';
  RAISE NOTICE '  【公众号】';
  RAISE NOTICE '  - wechat-article (公众号-文章撰写)';
  RAISE NOTICE '  - wechat-continue (公众号-文本续写)';
  RAISE NOTICE '  - wechat-title (公众号-标题)';
  RAISE NOTICE '  - wechat-clickbait (公众号-标题党)';
  RAISE NOTICE '  【今日头条】';
  RAISE NOTICE '  - toutiao-article (今日头条-爆文)';
  RAISE NOTICE '  - toutiao-title (今日头条-爆款标题)';
  RAISE NOTICE '  - toutiao-qa (今日头条-问答)';
  RAISE NOTICE '  - toutiao-micro (今日头条-微头条)';
  RAISE NOTICE '  - toutiao-outline (今日头条-文章大纲)';
  RAISE NOTICE '  【微博】';
  RAISE NOTICE '  - weibo-short (微博-短推文)';
  RAISE NOTICE '  - weibo-long (微博-长文)';
  RAISE NOTICE '  - weibo-title (微博-爆款标题)';
  RAISE NOTICE '  - weibo-name (微博-账号名称)';
  RAISE NOTICE '  - weibo-hotspot (微博-热点分析)';
  RAISE NOTICE '  - weibo-profile (微博-账号简介)';
  RAISE NOTICE '  - weibo-post (微博-推文)';
  RAISE NOTICE '  【知乎】';
  RAISE NOTICE '  - zhihu-qa (知乎-高赞问答)';
  RAISE NOTICE '  - zhihu-answer (知乎-高赞回答仿写)';
  RAISE NOTICE '  - zhihu-bio (知乎-账号个人简介)';
  RAISE NOTICE '  - zhihu-tagline (知乎-一句话简介)';
  RAISE NOTICE '  - zhihu-username (知乎-账号名称)';
END $$;
