/**
 * 统一的模板配置系统
 * 遵循开放封闭原则：扩展时只需添加配置，无需修改现有代码
 */

export type TemplateCategory =
  | "xiaohongshu"    // 小红书
  | "wechat"         // 公众号
  | "toutiao"        // 今日头条
  | "weibo"          // 微博运营
  | "zhihu"          // 知乎运营
  | "private"        // 私域运营
  | "video"          // 短视频
  | "live"           // 直播
  | "data-analysis"  // 数据分析
  | "report"         // 汇报材料
  | "business"       // 商业
  | "general";       // 通用写作

export interface CustomField {
  name: string;
  label: string;
  type: "input" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  description?: string;
}

export interface TemplateConfig {
  // 基础信息
  id: number;                    // 主ID（数字）
  legacyIds?: number[];          // 旧ID列表（向后兼容）
  category: TemplateCategory;    // 分类
  title: string;                 // 标题
  desc: string;                  // 描述

  // UI配置
  icon: string;                  // 图标（emoji或图片路径）
  iconBg: string;                // 背景色类名

  // 路由配置
  apiEndpoint: string;           // API端点
  routePath: string;             // 路由路径
  pageComponent?: string;        // 页面组件类型

  // 表单配置
  customFields?: CustomField[];  // 自定义表单字段

  // 示例提示词
  examplePrompts?: string[];     // 示例提示词列表

  // 欢迎文本
  welcomeText?: string;          // 欢迎文本

  // 功能开关
  enableConversationHistory?: boolean;  // 是否启用对话历史
}

/**
 * 中心化的模板配置表
 * 新增模板时只需在此添加配置即可
 */
export const TEMPLATE_REGISTRY: Record<number, TemplateConfig> = {
  // ========== 小红书类 (101-108) ==========
  101: {
    id: 101,
    category: "xiaohongshu",
    title: "小红书旅游攻略",
    desc: "设计一系列能够吸引小红书用户关注的旅游攻略内容。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/travel-guide",
    routePath: "/writing/xiaohongshu",
  },

  102: {
    id: 102,
    legacyIds: [1, 11], // 侧边栏旧ID和其他旧ID
    category: "xiaohongshu",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意力、引发共鸣、促进互动的自媒体文案。",
    icon: "/6bd5a3e5806a1f91e9e4eb4118c2c274.png",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu",
    routePath: "/writing/xiaohongshu",
  },

  103: {
    id: 103,
    legacyIds: [6], // 侧边栏旧ID
    category: "xiaohongshu",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众、提高点击率和互动率的标题。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu-title",
    routePath: "/writing/xiaohongshu",
  },

  104: {
    id: 104,
    category: "xiaohongshu",
    title: "小红书账号简介",
    desc: "设计一个能够吸引目标受众并反映个人品牌特色的小红书账号简介。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu-profile",
    routePath: "/writing/xiaohongshu",
  },

  105: {
    id: 105,
    category: "xiaohongshu",
    title: "小红书seo关键词布局",
    desc: "设计一个能够帮助用户在小红书上进行有效SEO关键词布局的流程，以提高内容的搜索排名和用户参与度。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu-seo",
    routePath: "/writing/xiaohongshu",
  },

  106: {
    id: 106,
    category: "xiaohongshu",
    title: "小红书风格排版",
    desc: "创作出能够吸引小红书用户注意力的高质量内容，提升个人品牌影响力。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu-style",
    routePath: "/writing/xiaohongshu",
  },

  107: {
    id: 107,
    category: "xiaohongshu",
    title: "小红书产品种草笔记",
    desc: "创作出能够吸引目标受众、增加互动和转化的高质量种草笔记。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/product-review",
    routePath: "/writing/xiaohongshu",
  },

  108: {
    id: 108,
    category: "xiaohongshu",
    title: "小红书好物推荐",
    desc: "创作出能够引起目标受众兴趣和购买欲望的好物推荐文案。",
    icon: "📝",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/product-recommendation",
    routePath: "/writing/xiaohongshu",
  },

  // ========== 公众号类 (201-208) ==========
  201: {
    id: 201,
    legacyIds: [3, 109, 204], // 侧边栏旧ID和其他旧ID
    category: "wechat",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章，提升文章的吸引力和传播力。",
    icon: "💬",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/official-account-article",
    routePath: "/writing/wechat",
    enableConversationHistory: true,
  },

  202: {
    id: 202,
    category: "wechat",
    title: "公众号文本续写",
    desc: "设计一个能够帮助用户快速生成公众号文案的提示词框架，提高文案的吸引力和传播效果。",
    icon: "💬",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/wechat-continue",
    routePath: "/writing/wechat",
  },

  203: {
    id: 203,
    category: "wechat",
    title: "公众号标题",
    desc: "设计出能够激发目标受众兴趣并促使他们点击阅读的公众号标题。",
    icon: "💬",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/wechat-title",
    routePath: "/writing/wechat",
  },

  205: {
    id: 205,
    category: "wechat",
    title: "公众号标题党",
    desc: "设计引人注目的公众号标题，以增加文章的曝光率和互动。",
    icon: "💬",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/wechat-clickbait",
    routePath: "/writing/wechat",
  },

  // ========== 今日头条类 (301-305) ==========
  301: {
    id: 301,
    category: "toutiao",
    title: "头条爆文",
    desc: "帮助用户创作出能够吸引大量读者、提高阅读量和互动率的爆款文章。",
    icon: "📰",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/toutiao-article",
    routePath: "/writing/toutiao",
  },

  302: {
    id: 302,
    category: "toutiao",
    title: "头条爆款标题",
    desc: "设计出能够迅速抓住用户眼球的头条爆款标题，提升内容的打开率和分享率。",
    icon: "📰",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/toutiao-title",
    routePath: "/writing/toutiao",
  },

  303: {
    id: 303,
    category: "toutiao",
    title: "头条问答",
    desc: "创作出能够在头条问答平台上引起广泛关注和讨论的内容。",
    icon: "📰",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/toutiao-qa",
    routePath: "/writing/toutiao",
  },

  304: {
    id: 304,
    category: "toutiao",
    title: "微头条文案",
    desc: "设计一个能够帮助用户快速构思并创作出高质量微头条文案的提示词框架。",
    icon: "📰",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/weitoutiao",
    routePath: "/writing/toutiao",
  },

  305: {
    id: 305,
    category: "toutiao",
    title: "头条文章大纲",
    desc: "设计一个结构清晰、内容丰富、能够吸引读者的头条文章大纲。",
    icon: "📰",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/toutiao-outline",
    routePath: "/writing/toutiao",
  },

  // ========== 微博运营类 (401-407) ==========
  401: {
    id: 401,
    category: "weibo",
    title: "微博短推文",
    desc: "创作能够引发共鸣、传播和互动的微博短推文。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-short",
    routePath: "/writing/weibo",
  },

  402: {
    id: 402,
    category: "weibo",
    title: "微博长文",
    desc: "创作出能够引起共鸣、传播和讨论的微博长文。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-long",
    routePath: "/writing/weibo",
  },

  403: {
    id: 403,
    category: "weibo",
    title: "微博爆款标题",
    desc: "设计出能够迅速吸引用户注意并引发传播的微博爆款标题。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-title",
    routePath: "/writing/weibo",
  },

  404: {
    id: 404,
    category: "weibo",
    title: "微博账号名称",
    desc: "设计一个易于识别、记忆并且能够代表用户品牌或个性的微博账号名称。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-username",
    routePath: "/writing/weibo",
  },

  405: {
    id: 405,
    category: "weibo",
    title: "微博热点分析",
    desc: "设计一个能够引导用户深入分析微博热点的提示词，帮助用户理解当前社交媒体上的流行话题和用户兴趣。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-trend",
    routePath: "/writing/weibo",
  },

  406: {
    id: 406,
    category: "weibo",
    title: "微博账号简介",
    desc: "设计一个能够吸引目标受众、展现个人特色和专业领域的微博账号简介。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-bio",
    routePath: "/writing/weibo",
  },

  407: {
    id: 407,
    category: "weibo",
    title: "微博推文",
    desc: "设计吸引用户注意力的微博推文，提高用户参与度和内容传播力。",
    icon: "🐦",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/weibo-tweet",
    routePath: "/writing/weibo",
  },

  // ========== 知乎运营类 (501-505) ==========
  501: {
    id: 501,
    category: "zhihu",
    title: "知乎高赞问答",
    desc: "设计一个能够帮助用户快速创作出高赞问答的流程，提高用户在知乎上的互动和影响力。",
    icon: "🔵",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/zhihu-qa",
    routePath: "/writing/zhihu",
  },

  502: {
    id: 502,
    category: "zhihu",
    title: "知乎高赞回答仿写",
    desc: "创作出能够吸引知乎用户注意、引发讨论并获得高赞的回答。",
    icon: "🔵",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/zhihu-answer",
    routePath: "/writing/zhihu",
  },

  503: {
    id: 503,
    category: "zhihu",
    title: "知乎账号个人简介",
    desc: "帮助用户创建一个能够反映其专业背景、兴趣和个性的个人简介。",
    icon: "🔵",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/zhihu-bio",
    routePath: "/writing/zhihu",
  },

  504: {
    id: 504,
    category: "zhihu",
    title: "知乎一句话简介",
    desc: "创作出能够引起广泛关注和讨论的知乎文章或回答。",
    icon: "🔵",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/zhihu-tagline",
    routePath: "/writing/zhihu",
  },

  505: {
    id: 505,
    category: "zhihu",
    title: "知乎账号名称",
    desc: "创作出能够吸引知乎用户关注和参与讨论的高质量内容。",
    icon: "🔵",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/zhihu-username",
    routePath: "/writing/zhihu",
  },

  // ========== 私域运营类 (601-607) ==========
  601: {
    id: 601,
    category: "private",
    title: "私域日常文案库",
    desc: "创作出能够引起目标受众共鸣、激发行动或引发讨论的文案。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-daily",
    routePath: "/writing/private",
  },

  602: {
    id: 602,
    category: "private",
    title: "私域朋友圈发文计划库",
    desc: "设计一系列能够激发朋友圈用户兴趣和互动的发文计划。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-moments",
    routePath: "/writing/private",
  },

  603: {
    id: 603,
    category: "private",
    title: "私域价值感文案库",
    desc: "设计一个能够引导用户创作出有吸引力的私域价值感文案的提示词。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-value",
    routePath: "/writing/private",
  },

  604: {
    id: 604,
    category: "private",
    title: "私域产品营销文案库",
    desc: "提供一个结构化的提示词框架，帮助用户快速生成具有吸引力的营销文案。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-marketing",
    routePath: "/writing/private",
  },

  605: {
    id: 605,
    category: "private",
    title: "私域客户回复助手",
    desc: "帮助用户快速生成针对不同客户情况的回复建议，提升客户满意度和忠诚度。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-reply",
    routePath: "/writing/private",
  },

  606: {
    id: 606,
    category: "private",
    title: "私域社群活动策划",
    desc: "设计一系列能够吸引社群成员参与的活动，提高社群活跃度和成员忠诚度。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-event",
    routePath: "/writing/private",
  },

  607: {
    id: 607,
    category: "private",
    title: "私域社群规则生成库",
    desc: "设计一套既能激发成员积极性，又能维护社群秩序的规则体系。",
    icon: "👥",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/private-rules",
    routePath: "/writing/private",
  },

  // ========== 视频文案类 (1001-1015) ==========
  1001: {
    id: 1001,
    category: "video",
    title: "短视频脚本大纲",
    desc: "设计一个结构清晰、内容丰富、易于执行的短视频脚本大纲。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-script-outline",
    routePath: "/writing/video",
  },

  1002: {
    id: 1002,
    legacyIds: [4], // 首页旧ID
    category: "video",
    title: "短视频爆款文案",
    desc: "设计能够迅速吸引观众注意力并激发他们情感共鸣的短视频文案。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-viral-copy",
    routePath: "/writing/video",
  },

  1003: {
    id: 1003,
    category: "video",
    title: "短视频爆款标题",
    desc: "设计出能够迅速吸引观众群体注意的短视频标题。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-viral-title",
    routePath: "/writing/video",
  },

  1004: {
    id: 1004,
    category: "video",
    title: "短视频分镜头脚本",
    desc: "设计一个能够帮助用户快速梳理短视频分镜头脚本的提示词。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-storyboard",
    routePath: "/writing/video",
  },

  1005: {
    id: 1005,
    legacyIds: [9], // 首页旧ID
    category: "video",
    title: "短视频黄金3秒开头",
    desc: "设计出能够迅速吸引观众并促使他们继续观看的短视频开头。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-golden-3sec",
    routePath: "/writing/video",
  },

  1006: {
    id: 1006,
    category: "video",
    title: "短视频带货口播文案",
    desc: "设计出能够吸引目标受众、提升商品曝光度和转化率的短视频带货口播文案。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-sales-script",
    routePath: "/writing/video",
  },

  1007: {
    id: 1007,
    category: "video",
    title: "短视频软广脚本",
    desc: "创作出既能够吸引观众,又能够巧妙地推广产品或服务的短视频脚本。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-soft-ad",
    routePath: "/writing/video",
  },

  1008: {
    id: 1008,
    category: "video",
    title: "短视频卖点脚本",
    desc: "设计出能够迅速吸引观众注意并促使其分享的短视频脚本。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-selling-point",
    routePath: "/writing/video",
  },

  1009: {
    id: 1009,
    category: "video",
    title: "短视频硬广脚本",
    desc: "设计出能够迅速吸引目标受众注意力并促使其采取行动的短视频广告脚本。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-hard-ad",
    routePath: "/writing/video",
  },

  1010: {
    id: 1010,
    category: "video",
    title: "短视频钩子脚本",
    desc: "设计能够快速吸引观众注意力的短视频钩子脚本。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-hook-script",
    routePath: "/writing/video",
  },

  1011: {
    id: 1011,
    category: "video",
    title: "短视频抛问题法",
    desc: "设计一个能够帮助用户快速创作出吸引观众的短视频内容的提示词。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-question-method",
    routePath: "/writing/video",
  },

  1012: {
    id: 1012,
    category: "video",
    title: "短视频技巧放大法",
    desc: "设计一个能够帮助用户提升短视频吸引力和观众参与度的提示词。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-technique-amplify",
    routePath: "/writing/video",
  },

  1013: {
    id: 1013,
    category: "video",
    title: "短视频数据佐证法",
    desc: "帮助用户通过短视频数据来佐证其内容创作的有效性,提高内容的吸引力和传播力。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-data-proof",
    routePath: "/writing/video",
  },

  1014: {
    id: 1014,
    category: "video",
    title: "短视频指出错误法",
    desc: "设计一个能够指导用户识别和纠正短视频中错误的提示词,提高内容的准确性和可信度。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-error-point",
    routePath: "/writing/video",
  },

  1015: {
    id: 1015,
    category: "video",
    title: "短视频列举法",
    desc: "设计一套能够帮助用户快速生成短视频创意和脚本的提示词。",
    icon: "🎬",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/video-list-method",
    routePath: "/writing/video",
  },

  // ========== 快手运营类 (4001-4005) ==========
  4001: {
    id: 4001,
    category: "video",
    title: "快手账号名称",
    desc: "设计能够吸引目标观众群体的短视频标题和内容,提高用户参与度和账号影响力。",
    icon: "⚡",
    iconBg: "bg-orange-600",
    apiEndpoint: "/api/kuaishou-name",
    routePath: "/writing/kuaishou",
  },

  4002: {
    id: 4002,
    category: "video",
    title: "快手带货口播文案",
    desc: "设计能够吸引观众、促进销售的口播文案,同时确保文案内容真实、吸引人,不夸大其词。",
    icon: "⚡",
    iconBg: "bg-orange-600",
    apiEndpoint: "/api/kuaishou-live",
    routePath: "/writing/kuaishou",
  },

  4003: {
    id: 4003,
    category: "video",
    title: "快手分镜头脚本",
    desc: "设计一个能够吸引快手平台观众的短视频分镜头脚本,确保内容有趣、有教育意义或有娱乐价值。",
    icon: "⚡",
    iconBg: "bg-orange-600",
    apiEndpoint: "/api/kuaishou-script",
    routePath: "/writing/kuaishou",
  },

  4004: {
    id: 4004,
    category: "video",
    title: "快手爆款标题",
    desc: "设计出能够吸引观众注意力并提高视频点击率的短视频标题。",
    icon: "⚡",
    iconBg: "bg-orange-600",
    apiEndpoint: "/api/kuaishou-title",
    routePath: "/writing/kuaishou",
  },

  4005: {
    id: 4005,
    category: "video",
    title: "快手账号简介",
    desc: "制作并发布能够吸引观众、引发讨论、增加粉丝互动的短视频内容。",
    icon: "⚡",
    iconBg: "bg-orange-600",
    apiEndpoint: "/api/kuaishou-profile",
    routePath: "/writing/kuaishou",
  },

  // ========== 抖音运营类 (2001-2007) ==========
  2001: {
    id: 2001,
    category: "video",
    title: "企业抖音矩阵运营战略图",
    desc: "制定《企业抖音矩阵运营战略图》,帮助企业在抖音平台上实现品牌的全面覆盖和用户的深度粘性。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-strategy",
    routePath: "/writing/douyin",
  },

  2002: {
    id: 2002,
    category: "video",
    title: "抖音爆款标题",
    desc: "设计出能够迅速吸引观众注意并增加视频观看量的短视频标题。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-title",
    routePath: "/writing/douyin",
  },

  2003: {
    id: 2003,
    category: "video",
    title: "抖音分镜头脚本",
    desc: "设计一个能够指导用户创作出具有吸引力的抖音短视频分镜头脚本的提示词。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-script",
    routePath: "/writing/douyin",
  },

  2004: {
    id: 2004,
    category: "video",
    title: "抖音账号简介",
    desc: "设计一个能够吸引目标观众的抖音账号简介,同时展示个人品牌和内容特色。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-profile",
    routePath: "/writing/douyin",
  },

  2005: {
    id: 2005,
    category: "video",
    title: "抖音蹭蹭热点选题",
    desc: "设计一系列能够迅速吸引观众注意力的短视频选题。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-hotspot",
    routePath: "/writing/douyin",
  },

  2006: {
    id: 2006,
    category: "video",
    title: "抖音选题方向",
    desc: "设计一系列能够吸引观众的短视频选题,提高视频的观看量和互动率。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-topic",
    routePath: "/writing/douyin",
  },

  2007: {
    id: 2007,
    category: "video",
    title: "抖音账号名称",
    desc: "设计一个能够帮助用户快速生成短视频创意的提示词,提高内容的吸引力和观众参与度。",
    icon: "🎵",
    iconBg: "bg-black",
    apiEndpoint: "/api/douyin-name",
    routePath: "/writing/douyin",
  },

  // ========== 数据分析类 (5001-5006) ==========
  5001: {
    id: 5001,
    category: "data-analysis",
    title: "短视频播放分析",
    desc: "设计一个能够指导用户进行短视频播放分析的流程,帮助用户理解观众喜好,优化视频内容。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/video-play-analysis",
    routePath: "/writing/data-analysis",
  },

  5002: {
    id: 5002,
    category: "data-analysis",
    title: "短视频观众分析",
    desc: "设计一个能够提供深入观众分析的提示词,帮助用户理解短视频观众的行为模式,从而创作出更受欢迎的内容。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/video-audience-analysis",
    routePath: "/writing/data-analysis",
  },

  5003: {
    id: 5003,
    category: "data-analysis",
    title: "直播成交数据分析",
    desc: "设计一个短视频脚本,清晰展示直播成交数据的关键指标和趋势,以吸引观众并促进销售。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/live-sales-analysis",
    routePath: "/writing/data-analysis",
  },

  5004: {
    id: 5004,
    category: "data-analysis",
    title: "直播观看数据分析",
    desc: "设计一个能够指导内容创作者通过分析直播数据来提高观众参与度和内容吸引力的提示词。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/live-view-analysis",
    routePath: "/writing/data-analysis",
  },

  5005: {
    id: 5005,
    category: "data-analysis",
    title: "短视频互动分析",
    desc: "设计一个能够引导用户进行短视频内容创作和分析的提示词,帮助用户创作出吸引观众的内容。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/video-interaction-analysis",
    routePath: "/writing/data-analysis",
  },

  5006: {
    id: 5006,
    category: "data-analysis",
    title: "短视频成交分析",
    desc: "设计一个能够指导用户如何分析短视频成交数据的流程,帮助用户洞察市场趋势和消费者偏好。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/video-sales-analysis",
    routePath: "/writing/data-analysis",
  },

  // ========== 直播话术类 (6001-6013) ==========
  6001: {
    id: 6001,
    category: "live",
    title: "直播产品卖点话术",
    desc: "设计能够吸引目标观众的直播话术,提高产品销售。",
    icon: "🎙️",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/live-product-selling",
    routePath: "/writing/live-streaming",
  },

  6002: {
    id: 6002,
    category: "live",
    title: "直播成交话术",
    desc: "设计一套能够提升直播销售效率和成交率的话术。",
    icon: "🎙️",
    iconBg: "bg-pink-500",
    apiEndpoint: "/api/live-closing",
    routePath: "/writing/live-streaming",
  },

  6003: {
    id: 6003,
    category: "live",
    title: "直播基础品话术",
    desc: "设计一套能够吸引观众并促进销售的直播话术。",
    icon: "🎙️",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/live-basic-product",
    routePath: "/writing/live-streaming",
  },

  6004: {
    id: 6004,
    category: "live",
    title: "直播互动话术",
    desc: "设计一套能够提升直播互动性、观众参与度和直播效果的话术。",
    icon: "🎙️",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/live-interaction",
    routePath: "/writing/live-streaming",
  },

  6005: {
    id: 6005,
    category: "live",
    title: "直播停留话术",
    desc: "设计能够吸引并留住观众的直播话术,提高观众的参与度和互动性。",
    icon: "🎙️",
    iconBg: "bg-pink-500",
    apiEndpoint: "/api/live-retention",
    routePath: "/writing/live-streaming",
  },

  6006: {
    id: 6006,
    category: "live",
    title: "直播组合品话术",
    desc: "设计能够吸引观众注意力、激发购买欲望的直播话术。",
    icon: "🎙️",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/live-combo-product",
    routePath: "/writing/live-streaming",
  },

  6007: {
    id: 6007,
    category: "live",
    title: "直播福利品话术",
    desc: "设计一套能够吸引观众、提高产品吸引力和销售转化率的直播福利品话术。",
    icon: "🎙️",
    iconBg: "bg-pink-500",
    apiEndpoint: "/api/live-welfare-product",
    routePath: "/writing/live-streaming",
  },

  6008: {
    id: 6008,
    category: "live",
    title: "直播催单话术",
    desc: "设计一套能够提高直播销售转化率的催单话术。",
    icon: "🎙️",
    iconBg: "bg-pink-500",
    apiEndpoint: "/api/live-urgency",
    routePath: "/writing/live-streaming",
  },

  6009: {
    id: 6009,
    category: "live",
    title: "直播下播话术",
    desc: "设计一套能够让观众感到满意、期待下一次直播的下播话术。",
    icon: "🎙️",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/live-ending",
    routePath: "/writing/live-streaming",
  },

  6010: {
    id: 6010,
    category: "live",
    title: "30分钟直播话术",
    desc: "设计一套能够吸引观众、维持观众兴趣,并在30分钟内传达核心信息的话术。",
    icon: "🎙️",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/live-30min-script",
    routePath: "/writing/live-streaming",
  },

  6011: {
    id: 6011,
    category: "live",
    title: "直播带货脚本",
    desc: "设计一个能够吸引观众、展示产品特点并促进销售的直播带货脚本。",
    icon: "🎙️",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/live-sales-script",
    routePath: "/writing/live-streaming",
  },

  6012: {
    id: 6012,
    category: "live",
    title: "主播成长规划",
    desc: "帮助主播明确他们的职业目标,制定实现这些目标的具体步骤,以及提供持续的个人成长和职业发展支持。",
    icon: "🎙️",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/live-host-growth",
    routePath: "/writing/live-streaming",
  },

  6013: {
    id: 6013,
    category: "live",
    title: "直播间标题生成器",
    desc: "设计出能够吸引目标观众群体的直播间标题,提升直播间的吸引力和观众参与度。",
    icon: "🎙️",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/live-title-generator",
    routePath: "/writing/live-streaming",
  },

  // ========== 汇报总结类 (1101-1112) ==========
  1101: {
    id: 1101,
    category: "report",
    title: "周/月/季度工作总结",
    desc: "为用户提供详细、实用的《周/月/季度工作总结》撰写指南。",
    icon: "📊",
    iconBg: "bg-blue-500",
    apiEndpoint: "/api/report/work-summary",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1102: {
    id: 1102,
    category: "report",
    title: "周/月/季度工作计划",
    desc: "帮助用户掌握《周/月/季度工作计划》的撰写技巧，提供详细、实用的写作指导。",
    icon: "📋",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/report/work-plan",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1103: {
    id: 1103,
    category: "report",
    title: "项目进度报告",
    desc: "编写一份详细、清晰的项目进度报告，使相关人员能够快速了解项目的进展情况、存在的问题及解决方案。",
    icon: "📈",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/report/project-progress",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1104: {
    id: 1104,
    category: "report",
    title: "销售业绩报告",
    desc: "撰写一份全面、客观、具有洞察力的销售业绩报告，为企业决策提供有力支持。",
    icon: "💰",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/report/sales-performance",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1105: {
    id: 1105,
    category: "report",
    title: "财务报告",
    desc: "编写一份结构清晰、内容准确、易于理解的财务报告，满足读者对财务信息的需求。",
    icon: "💵",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/report/financial",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1106: {
    id: 1106,
    category: "report",
    title: "市场分析报告",
    desc: "撰写一份全面、准确、具有洞察力的市场分析报告，为企业决策提供依据。",
    icon: "📊",
    iconBg: "bg-indigo-500",
    apiEndpoint: "/api/report/market-analysis",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1107: {
    id: 1107,
    category: "report",
    title: "年度述职报告",
    desc: "帮助用户撰写一份内容全面、结构清晰、重点突出的年度述职报告。",
    icon: "📝",
    iconBg: "bg-pink-500",
    apiEndpoint: "/api/report/annual-review",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1108: {
    id: 1108,
    category: "report",
    title: "转正述职报告",
    desc: "帮助用户撰写一份内容全面、结构清晰、重点突出的转正述职报告，以提高用户通过转正评估的成功率。",
    icon: "📄",
    iconBg: "bg-teal-500",
    apiEndpoint: "/api/report/probation-review",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1109: {
    id: 1109,
    category: "report",
    title: "绩效评估报告",
    desc: "撰写一份详细、准确、客观的绩效评估报告，为企业的人力资源管理提供有力的支持。",
    icon: "📑",
    iconBg: "bg-cyan-500",
    apiEndpoint: "/api/report/performance-evaluation",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1110: {
    id: 1110,
    category: "report",
    title: "绩效改进计划",
    desc: "撰写一份详细、实用的绩效改进计划，帮助员工明确改进方向和步骤。",
    icon: "🎯",
    iconBg: "bg-yellow-500",
    apiEndpoint: "/api/report/performance-improvement",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1111: {
    id: 1111,
    category: "report",
    title: "部门简报",
    desc: "帮助用户掌握部门简报的写作方法，提高信息传达的效果和效率。",
    icon: "📰",
    iconBg: "bg-lime-500",
    apiEndpoint: "/api/report/department-brief",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  1112: {
    id: 1112,
    category: "report",
    title: "业务发展计划",
    desc: "撰写一份高质量的《业务发展计划》，为企业的业务发展提供明确的方向和可行的策略。",
    icon: "📈",
    iconBg: "bg-amber-500",
    apiEndpoint: "/api/report/business-development",
    routePath: "/writing/report",
    enableConversationHistory: true,
  },

  // ========== 事务公文类 (2101-2112) ==========
  2101: {
    id: 2101,
    category: "general",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有说服力的汇报材料。",
    icon: "📋",
    iconBg: "bg-blue-600",
    apiEndpoint: "/api/administrative/report-material",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2102: {
    id: 2102,
    category: "general",
    title: "检查报告",
    desc: "撰写一份系统、专业的检查报告。",
    icon: "🔍",
    iconBg: "bg-green-600",
    apiEndpoint: "/api/administrative/inspection-report",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2103: {
    id: 2103,
    category: "general",
    title: "督查通报",
    desc: "撰写一份规范、严谨的督查通报。",
    icon: "📢",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/administrative/supervision-notice",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2104: {
    id: 2104,
    category: "general",
    title: "评估报告",
    desc: "撰写一份科学、客观的评估报告。",
    icon: "📊",
    iconBg: "bg-purple-600",
    apiEndpoint: "/api/administrative/evaluation-report",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2105: {
    id: 2105,
    category: "general",
    title: "应急预案",
    desc: "编制一份完整、可操作的应急预案。",
    icon: "🚨",
    iconBg: "bg-orange-600",
    apiEndpoint: "/api/administrative/emergency-plan",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2106: {
    id: 2106,
    category: "general",
    title: "项目申请书",
    desc: "撰写一份专业、有说服力的项目申请书。",
    icon: "📝",
    iconBg: "bg-indigo-600",
    apiEndpoint: "/api/administrative/project-application",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2107: {
    id: 2107,
    category: "general",
    title: "合同协议",
    desc: "起草一份规范、严谨的合同协议。",
    icon: "📄",
    iconBg: "bg-teal-600",
    apiEndpoint: "/api/administrative/contract-agreement",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2108: {
    id: 2108,
    category: "general",
    title: "法律意见书",
    desc: "出具一份专业、权威的法律意见书。",
    icon: "⚖️",
    iconBg: "bg-gray-700",
    apiEndpoint: "/api/administrative/legal-opinion",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2109: {
    id: 2109,
    category: "general",
    title: "工作计划",
    desc: "制定一份详细、可执行的工作计划。",
    icon: "📅",
    iconBg: "bg-cyan-600",
    apiEndpoint: "/api/administrative/work-plan",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2110: {
    id: 2110,
    category: "general",
    title: "工作总结",
    desc: "撰写一份全面、深入的工作总结。",
    icon: "📑",
    iconBg: "bg-lime-600",
    apiEndpoint: "/api/administrative/work-summary",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2111: {
    id: 2111,
    category: "general",
    title: "调研报告",
    desc: "撰写一份深入、有见地的调研报告。",
    icon: "🔬",
    iconBg: "bg-pink-600",
    apiEndpoint: "/api/administrative/research-report",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },

  2112: {
    id: 2112,
    category: "general",
    title: "会议纪要",
    desc: "撰写一份准确、规范的会议纪要。",
    icon: "📝",
    iconBg: "bg-amber-600",
    apiEndpoint: "/api/administrative/meeting-minutes",
    routePath: "/writing/administrative",
    enableConversationHistory: true,
  },
};

/**
 * 工具函数：根据模板ID获取配置（支持legacyIds）
 */
export function getTemplateById(id: number): TemplateConfig | null {
  // 直接查找
  if (TEMPLATE_REGISTRY[id]) {
    return TEMPLATE_REGISTRY[id];
  }

  // 查找legacyIds
  for (const template of Object.values(TEMPLATE_REGISTRY)) {
    if (template.legacyIds?.includes(id)) {
      return template;
    }
  }

  return null;
}

/**
 * 工具函数：获取规范ID（将旧ID转换为新ID）
 */
export function getCanonicalId(id: number): number {
  const template = getTemplateById(id);
  return template?.id || id;
}

/**
 * 工具函数：根据分类获取所有模板
 */
export function getTemplatesByCategory(category: TemplateCategory): TemplateConfig[] {
  return Object.values(TEMPLATE_REGISTRY).filter(
    (template) => template.category === category
  );
}

/**
 * 工具函数：获取模板的API端点
 */
export function getTemplateApiEndpoint(id: number): string {
  const config = getTemplateById(id);
  if (!config) {
    throw new Error(`Template ${id} not found in registry`);
  }
  return config.apiEndpoint;
}

/**
 * 工具函数：获取模板的路由路径
 */
export function getTemplateRoutePath(id: number): string {
  const config = getTemplateById(id);
  if (!config) {
    throw new Error(`Template ${id} not found in registry`);
  }
  return config.routePath;
}

/**
 * 工具函数：验证模板是否需要自定义字段
 */
export function templateHasCustomFields(id: number): boolean {
  const config = getTemplateById(id);
  return !!config?.customFields;
}

/**
 * 工具函数：检查ID是否为旧ID
 */
export function isLegacyId(id: number): boolean {
  // 如果直接存在于注册表中，不是旧ID
  if (TEMPLATE_REGISTRY[id]) {
    return false;
  }

  // 检查是否在某个模板的legacyIds中
  for (const template of Object.values(TEMPLATE_REGISTRY)) {
    if (template.legacyIds?.includes(id)) {
      return true;
    }
  }

  return false;
}

/**
 * 工具函数：获取所有模板
 */
export function getAllTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATE_REGISTRY);
}
