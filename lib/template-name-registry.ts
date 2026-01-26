/**
 * 模板名称到配置的映射
 * 这个文件确保同名模板在不同页面使用相同的API端点和UI设计
 *
 * 核心原则：
 * 1. 相同名字 = 相同系统提示词 = 相同API = 相同UI
 * 2. 图标可以不同，但功能必须一致
 * 3. 新增模板时只需在此添加映射，无需修改组件代码
 */

export interface TemplateMeta {
  // 模板名称（作为唯一标识）
  name: string;
  // API端点
  apiEndpoint: string;
  // 路由路径
  routePath: string;
  // 描述（可选，用于显示）
  description?: string;
  // 是否需要额外的自定义字段
  customFields?: {
    videoType?: boolean;
    audience?: boolean;
    goal?: boolean;
    articleType?: boolean;
    tone?: boolean;
  };
}

/**
 * 核心模板映射表
 * Key: 模板名称
 * Value: 模板元数据
 */
export const TEMPLATE_NAME_REGISTRY: Record<string, TemplateMeta> = {
  // ========== 短视频类 ==========
  "短视频爆款文案": {
    name: "短视频爆款文案",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    description: "设计能够迅速吸引观众注意力并激发他们情感共鸣的短视频文案",
    customFields: {
      videoType: true,
      audience: true,
      goal: true,
    },
  },
  "短视频黄金3秒开头": {
    name: "短视频黄金3秒开头",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    description: "设计出能够迅速吸引观众并促使他们继续观看的短视频开头",
    customFields: {
      videoType: true,
      audience: true,
      goal: true,
    },
  },
  "短视频脚本大纲": {
    name: "短视频脚本大纲",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    description: "设计一个结构清晰、内容丰富、易于执行的短视频脚本大纲",
    customFields: {
      videoType: true,
      audience: true,
      goal: true,
    },
  },
  "短视频分镜头脚本": {
    name: "短视频分镜头脚本",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    description: "设计一个能够帮助用户快速梳理短视频分镜头脚本的提示词",
    customFields: {
      videoType: true,
      audience: true,
    },
  },
  "短视频带货口播文案": {
    name: "短视频带货口播文案",
    apiEndpoint: "/api/video",
    routePath: "/writing/video",
    description: "设计出能够吸引目标受众、提升商品曝光度和转化率的短视频带货口播文案",
    customFields: {
      videoType: true,
      audience: true,
      goal: true,
    },
  },

  // ========== 小红书类 ==========
  "小红书爆款文案": {
    name: "小红书爆款文案",
    apiEndpoint: "/api/xiaohongshu",
    routePath: "/writing/xiaohongshu",
    description: "创作出能够吸引用户注意力的小红书文案",
  },
  "小红书爆款标题": {
    name: "小红书爆款标题",
    apiEndpoint: "/api/xiaohongshu",
    routePath: "/writing/xiaohongshu",
    description: "设计出能够吸引目标受众的小红书标题",
  },

  // ========== 公众号类 ==========
  "公众号文章撰写": {
    name: "公众号文章撰写",
    apiEndpoint: "/api/wechat-article",
    routePath: "/writing/xiaohongshu",
    description: "创作高质量的公众号文章",
    customFields: {
      articleType: true,
      tone: true,
    },
  },

  // ========== 汇报材料类 ==========
  "汇报材料": {
    name: "汇报材料",
    apiEndpoint: "/api/report",
    routePath: "/writing/report",
    description: "撰写一份全面、准确、有说服力的汇报材料",
  },
  "周/月/季度工作总结": {
    name: "周/月/季度工作总结",
    apiEndpoint: "/api/general",
    routePath: "/writing/general",
    description: "为用户提供详细、实用的工作总结模板",
  },

  // ========== 商业类 ==========
  "商业计划书": {
    name: "商业计划书",
    apiEndpoint: "/api/business",
    routePath: "/writing/business",
    description: "为客户撰写一份详细、全面的商业计划书",
  },

  // ========== 头条类 ==========
  "头条爆文": {
    name: "头条爆文",
    apiEndpoint: "/api/toutiao",
    routePath: "/writing/toutiao",
    description: "帮助用户创作出能够吸引读者的头条文章",
  },
};

/**
 * 根据模板名称获取配置
 */
export function getTemplateMetaByName(templateName: string): TemplateMeta | null {
  return TEMPLATE_NAME_REGISTRY[templateName] || null;
}

/**
 * 根据模板名称获取API端点
 */
export function getApiEndpointByName(templateName: string): string {
  const meta = getTemplateMetaByName(templateName);
  if (!meta) {
    console.warn(`Template "${templateName}" not found, using default API`);
    return "/api/xiaohongshu"; // 默认API
  }
  return meta.apiEndpoint;
}

/**
 * 根据模板名称获取路由路径
 */
export function getRoutePathByName(templateName: string): string {
  const meta = getTemplateMetaByName(templateName);
  if (!meta) {
    console.warn(`Template "${templateName}" not found, using default route`);
    return "/writing/xiaohongshu"; // 默认路由
  }
  return meta.routePath;
}

/**
 * 检查模板名称是否应该跳转到特定页面
 * @param templateName 模板名称
 * @param targetRoute 目标路由，如 "/writing/video"
 */
export function shouldRouteToPage(templateName: string, targetRoute: string): boolean {
  const meta = getTemplateMetaByName(templateName);
  return meta?.routePath === targetRoute;
}

/**
 * 获取所有视频相关模板名称
 */
export function getVideoTemplateNames(): string[] {
  return Object.values(TEMPLATE_NAME_REGISTRY)
    .filter((meta) => meta.routePath === "/writing/video")
    .map((meta) => meta.name);
}

/**
 * 检查是否为视频模板
 */
export function isVideoTemplate(templateName: string): boolean {
  const meta = getTemplateMetaByName(templateName);
  return meta?.routePath === "/writing/video";
}

/**
 * 检查是否为小红书模板
 */
export function isXiaohongshuTemplate(templateName: string): boolean {
  const meta = getTemplateMetaByName(templateName);
  return meta?.routePath === "/writing/xiaohongshu";
}

/**
 * 使用示例：
 *
 * // 在组件中
 * import { getTemplateMetaByName, getApiEndpointByName, getRoutePathByName } from "@/lib/template-name-registry";
 *
 * // 1. 获取API端点
 * const apiEndpoint = getApiEndpointByName("短视频爆款文案");
 * // 结果: "/api/video"
 *
 * // 2. 获取路由路径
 * const routePath = getRoutePathByName("短视频爆款文案");
 * router.push(`${routePath}?template=${id}&title=${title}`);
 *
 * // 3. 检查是否为视频模板
 * if (isVideoTemplate(template.title)) {
 *   // 使用视频专用UI
 * }
 *
 * // 4. 在模板点击处理中
 * const handleTemplateClick = (template) => {
 *   const routePath = getRoutePathByName(template.title);
 *   router.push(`${routePath}?template=${template.id}&title=${encodeURIComponent(template.title)}`);
 * };
 */
