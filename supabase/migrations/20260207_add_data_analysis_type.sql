-- ============================================
-- 添加数据分析类型支持
-- ============================================
-- 此脚本用于更新已存在的 conversations 表，添加数据分析类型支持
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
  'weibo-bio',
  'weibo-tweet',
  -- 知乎类型
  'zhihu-qa',
  'zhihu-answer',
  'zhihu-bio',
  'zhihu-tagline',
  'zhihu-username',
  -- 视频文案类型
  'video-script-outline',
  'video-viral-copy',
  'video-viral-title',
  'video-storyboard',
  'video-golden-3sec',
  'video-sales-script',
  'video-soft-ad',
  'video-selling-point',
  'video-hard-ad',
  'video-hook-script',
  'video-question-method',
  'video-technique-amplify',
  'video-data-proof',
  'video-error-point',
  'video-list-method',
  -- 私域运营类型
  'private-daily',
  'private-moments',
  'private-value',
  'private-marketing',
  'private-reply',
  'private-event',
  'private-rules',
  -- 快手运营类型
  'kuaishou-name',
  'kuaishou-live',
  'kuaishou-script',
  'kuaishou-title',
  'kuaishou-profile',
  -- 抖音运营类型
  'douyin-strategy',
  'douyin-title',
  'douyin-script',
  'douyin-profile',
  'douyin-hotspot',
  'douyin-topic',
  'douyin-name',
  -- 数据分析类型
  'data-analysis-video-play',
  'data-analysis-video-audience',
  'data-analysis-live-sales',
  'data-analysis-live-view',
  'data-analysis-video-interaction',
  'data-analysis-video-sales'
));

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '✅ 成功添加数据分析类型支持！';
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
  RAISE NOTICE '  - weibo-bio (微博-账号简介)';
  RAISE NOTICE '  - weibo-tweet (微博-推文)';
  RAISE NOTICE '  【知乎】';
  RAISE NOTICE '  - zhihu-qa (知乎-高赞问答)';
  RAISE NOTICE '  - zhihu-answer (知乎-高赞回答仿写)';
  RAISE NOTICE '  - zhihu-bio (知乎-账号个人简介)';
  RAISE NOTICE '  - zhihu-tagline (知乎-一句话简介)';
  RAISE NOTICE '  - zhihu-username (知乎-账号名称)';
  RAISE NOTICE '  【视频文案】';
  RAISE NOTICE '  - video-script-outline (短视频脚本大纲)';
  RAISE NOTICE '  - video-viral-copy (短视频爆款文案)';
  RAISE NOTICE '  - video-viral-title (短视频爆款标题)';
  RAISE NOTICE '  - video-storyboard (短视频分镜头脚本)';
  RAISE NOTICE '  - video-golden-3sec (短视频黄金3秒开头)';
  RAISE NOTICE '  - video-sales-script (短视频带货口播文案)';
  RAISE NOTICE '  - video-soft-ad (短视频软广脚本)';
  RAISE NOTICE '  - video-selling-point (短视频卖点脚本)';
  RAISE NOTICE '  - video-hard-ad (短视频硬广脚本)';
  RAISE NOTICE '  - video-hook-script (短视频钩子脚本)';
  RAISE NOTICE '  - video-question-method (短视频抛问题法)';
  RAISE NOTICE '  - video-technique-amplify (短视频技巧放大法)';
  RAISE NOTICE '  - video-data-proof (短视频数据佐证法)';
  RAISE NOTICE '  - video-error-point (短视频指出错误法)';
  RAISE NOTICE '  - video-list-method (短视频列举法)';
  RAISE NOTICE '  【私域运营】';
  RAISE NOTICE '  - private-daily (私域日常文案库)';
  RAISE NOTICE '  - private-moments (私域朋友圈发文计划库)';
  RAISE NOTICE '  - private-value (私域价值感文案库)';
  RAISE NOTICE '  - private-marketing (私域产品营销文案库)';
  RAISE NOTICE '  - private-reply (私域客户回复助手)';
  RAISE NOTICE '  - private-event (私域社群活动策划)';
  RAISE NOTICE '  - private-rules (私域社群规则生成库)';
  RAISE NOTICE '  【快手运营】';
  RAISE NOTICE '  - kuaishou-name (快手账号名称)';
  RAISE NOTICE '  - kuaishou-live (快手带货口播文案)';
  RAISE NOTICE '  - kuaishou-script (快手分镜头脚本)';
  RAISE NOTICE '  - kuaishou-title (快手爆款标题)';
  RAISE NOTICE '  - kuaishou-profile (快手账号简介)';
  RAISE NOTICE '  【抖音运营】';
  RAISE NOTICE '  - douyin-strategy (企业抖音矩阵运营战略图)';
  RAISE NOTICE '  - douyin-title (抖音爆款标题)';
  RAISE NOTICE '  - douyin-script (抖音分镜头脚本)';
  RAISE NOTICE '  - douyin-profile (抖音账号简介)';
  RAISE NOTICE '  - douyin-hotspot (抖音蹭热点选题)';
  RAISE NOTICE '  - douyin-topic (抖音选题方向)';
  RAISE NOTICE '  - douyin-name (抖音账号名称)';
  RAISE NOTICE '  【数据分析】';
  RAISE NOTICE '  - data-analysis-video-play (短视频播放分析)';
  RAISE NOTICE '  - data-analysis-video-audience (短视频观众分析)';
  RAISE NOTICE '  - data-analysis-live-sales (直播成交数据分析)';
  RAISE NOTICE '  - data-analysis-live-view (直播观看数据分析)';
  RAISE NOTICE '  - data-analysis-video-interaction (短视频互动分析)';
  RAISE NOTICE '  - data-analysis-video-sales (短视频成交分析)';
END $$;
