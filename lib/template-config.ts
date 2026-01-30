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
    legacyIds: [1], // 侧边栏旧ID
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
