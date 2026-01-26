/**
 * 统一的模板配置系统
 * 遵循开放封闭原则：扩展时只需添加配置，无需修改现有代码
 */

export type TemplateCategory =
  | "xiaohongshu"    // 小红书
  | "video"          // 短视频
  | "wechat"         // 公众号
  | "report"         // 汇报材料
  | "toutiao"        // 头条
  | "business"       // 商业
  | "general";       // 通用写作

export interface TemplateConfig {
  id: string;
  category: TemplateCategory;
  title: string;
  desc: string;
  icon: string;
  iconBg: string;
  apiEndpoint: string;
  routePath: string;
  // 可选：自定义输入字段
  customFields?: {
    videoType?: boolean;
    audience?: boolean;
    goal?: boolean;
  };
}

/**
 * 中心化的模板配置表
 * 新增模板时只需在此添加配置即可
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  // 小红书类模板
  "xhs-001": {
    id: "xhs-001",
    category: "xiaohongshu",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意...",
    icon: "xiaohongshu",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu",
    routePath: "/writing/xiaohongshu",
  },
  "xhs-002": {
    id: "xhs-002",
    category: "xiaohongshu",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众...",
    icon: "title",
    iconBg: "bg-red-500",
    apiEndpoint: "/api/xiaohongshu",
    routePath: "/writing/xiaohongshu",
  },

  // 短视频类模板
  "video-001": {
    id: "video-001",
    category: "video",
    title: "短视频爆款文案",
    desc: "设计能够迅速吸引观众注...",
    icon: "video",
    iconBg: "bg-amber-500",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    customFields: {
      videoType: true,
      audience: true,
      goal: true,
    },
  },
  "video-002": {
    id: "video-002",
    category: "video",
    title: "短视频黄金3秒开头",
    desc: "设计出能够迅速吸引观众...",
    icon: "hook",
    iconBg: "bg-amber-500",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    customFields: {
      videoType: true,
      audience: true,
      goal: true,
    },
  },

  // 公众号类模板
  "wechat-001": {
    id: "wechat-001",
    category: "wechat",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章...",
    icon: "wechat",
    iconBg: "bg-green-500",
    apiEndpoint: "/api/wechat-article",
    routePath: "/writing/wechat",
  },

  // 汇报材料类模板
  "report-001": {
    id: "report-001",
    category: "report",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有...",
    icon: "report",
    iconBg: "bg-emerald-500",
    apiEndpoint: "/api/report",
    routePath: "/writing/report",
  },

  // 头条类模板
  "toutiao-001": {
    id: "toutiao-001",
    category: "toutiao",
    title: "头条爆文",
    desc: "帮助用户创作出能够吸引...",
    icon: "toutiao",
    iconBg: "bg-red-600",
    apiEndpoint: "/api/toutiao",
    routePath: "/writing/toutiao",
  },

  // 商业类模板
  "business-001": {
    id: "business-001",
    category: "business",
    title: "商业计划书",
    desc: "为客户撰写一份详细、全...",
    icon: "business",
    iconBg: "bg-purple-500",
    apiEndpoint: "/api/business",
    routePath: "/writing/business",
  },

  // 通用写作类模板
  "general-001": {
    id: "general-001",
    category: "general",
    title: "周/月/季度工作总结",
    desc: "为用户提供详细、实用的...",
    icon: "weekly",
    iconBg: "bg-orange-500",
    apiEndpoint: "/api/general",
    routePath: "/writing/general",
  },
};

/**
 * 工具函数：根据模板ID获取配置
 */
export function getTemplateConfig(templateId: string): TemplateConfig | null {
  return TEMPLATE_REGISTRY[templateId] || null;
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
export function getTemplateApiEndpoint(templateId: string): string {
  const config = getTemplateConfig(templateId);
  if (!config) {
    throw new Error(`Template ${templateId} not found in registry`);
  }
  return config.apiEndpoint;
}

/**
 * 工具函数：获取模板的路由路径
 */
export function getTemplateRoutePath(templateId: string): string {
  const config = getTemplateConfig(templateId);
  if (!config) {
    throw new Error(`Template ${templateId} not found in registry`);
  }
  return config.routePath;
}

/**
 * 工具函数：验证模板是否需要自定义字段
 */
export function templateHasCustomFields(templateId: string): boolean {
  const config = getTemplateConfig(templateId);
  return !!config?.customFields;
}
