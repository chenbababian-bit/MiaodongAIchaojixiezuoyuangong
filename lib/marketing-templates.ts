// 营销模板数据

// 第二层分类（营销下的主要分类）
export const marketingSecondLevelCategories = [
  { id: "brand", label: "品牌" },
  { id: "creative", label: "创意" },
  { id: "media", label: "媒介" },
  { id: "activity", label: "活动策划" },
  { id: "research", label: "调研" },
  { id: "pr", label: "公关传播" },
  { id: "traffic", label: "流量投放" },
  { id: "game", label: "游戏推广" },
  { id: "b2b-management", label: "B2B营销管理" },
  { id: "b2b-digital", label: "B2B数字营销" },
  { id: "b2b-content", label: "B2B内容营销" },
  { id: "b2b-activity", label: "B2B活动营销" },
];

// 第三层分类（品牌下的子分类）
export const brandSubCategories = [
  { id: "brand-strategy", label: "品牌战略" },
  { id: "market-analysis", label: "市场分析" },
  { id: "creative-content", label: "创意内容" },
  { id: "brand-visual", label: "品牌视觉" },
  { id: "media-planning", label: "媒介规划" },
  { id: "brand-maintenance", label: "品牌维护" },
  { id: "internal-training", label: "内部培训" },
  { id: "report-summary", label: "报告总结" },
  { id: "innovation-planning", label: "创新规划" },
  { id: "legal-compliance", label: "法律合规" },
];

// 第三层分类（创意下的子分类）
export const creativeSubCategories = [
  { id: "creative-strategy", label: "创意策略" },
  { id: "design-visual", label: "设计视觉" },
  { id: "creative-development", label: "创意开发" },
  { id: "project-management", label: "项目管理" },
  { id: "training-development", label: "培训发展" },
  { id: "performance-evaluation", label: "绩效评估" },
  { id: "market-research", label: "市场调研" },
  { id: "innovation-trends", label: "创新趋势" },
  { id: "customer-relations", label: "客户关系" },
  { id: "financial-budget", label: "财务预算" },
  { id: "legal-compliance-creative", label: "法律合规" },
  { id: "technical-tools", label: "技术工具" },
];

// ========== 品牌战略模板 ==========
export const brandStrategyTemplates = [
  {
    id: 10001,
    icon: "🏢",
    title: "企业简介内容策划",
    desc: "撰写一份全面、准确、有吸引力的企业简介,突出企业的核心价值、业务特色和发展前景。",
    color: "bg-blue-500",
  },
  {
    id: 10002,
    icon: "🎯",
    title: "品牌定位语+品牌口号slogan",
    desc: "帮助用户深入理解各种品牌定位策略,并能够根据实际情况进行合理应用。",
    color: "bg-red-500",
  },
  {
    id: 10003,
    icon: "🏠",
    title: "品牌屋梳理",
    desc: "依据品牌屋逻辑,构建品牌定位及其核心表达。",
    color: "bg-purple-500",
  },
  {
    id: 10004,
    icon: "📊",
    title: "品牌定位报告",
    desc: "撰写一份详细、准确且具有可操作性的品牌定位报告,为品牌的发展提供有力的指导。",
    color: "bg-pink-500",
  },
  {
    id: 10005,
    icon: "🌟",
    title: "品牌愿景和使命",
    desc: "为客户撰写具有吸引力和可行性的品牌愿景和使命陈述,以提升品牌的核心价值和竞争力。",
    color: "bg-orange-500",
  },
  {
    id: 10006,
    icon: "💎",
    title: "品牌价值主张",
    desc: "为客户撰写一份具有吸引力和独特性的品牌价值主张,以提升品牌的竞争力和市场影响力。",
    color: "bg-indigo-500",
  },
  {
    id: 10007,
    icon: "🗺️",
    title: "品牌定位地图",
    desc: "为客户撰写一份详细、准确且具有可操作性的《品牌定位地图》,帮助客户明确品牌的市场定位和发展方向。",
    color: "bg-teal-500",
  },
  {
    id: 10008,
    icon: "🏗️",
    title: "品牌架构策略",
    desc: "制定一套全面、系统的品牌架构策略,以满足客户的品牌发展需求。",
    color: "bg-cyan-500",
  },
  {
    id: 10009,
    icon: "📖",
    title: "品牌故事与叙述",
    desc: "为客户打造具有吸引力和感染力的品牌故事,提升品牌的认知度和美誉度。",
    color: "bg-amber-500",
  },
  {
    id: 10010,
    icon: "👥",
    title: "目标受众分析",
    desc: "撰写一份详细且深入的《目标受众分析》,为品牌策略的制定提供有力支持。",
    color: "bg-green-500",
  },
  {
    id: 10011,
    icon: "⚔️",
    title: "竞争对手分析",
    desc: "撰写一份详细的《竞争对手分析》,为品牌策略的制定提供有力支持。",
    color: "bg-red-600",
  },
  {
    id: 10012,
    icon: "🎨",
    title: "品牌差异化策略",
    desc: "制定一套具有针对性和可操作性的品牌差异化策略,帮助企业在市场中脱颖而出。",
    color: "bg-purple-600",
  },
  {
    id: 10013,
    icon: "📈",
    title: "品牌扩展计划",
    desc: "制定一份全面、系统的品牌扩展计划,明确品牌扩展的目标、策略和实施步骤。",
    color: "bg-blue-600",
  },
  {
    id: 10014,
    icon: "🛡️",
    title: "品牌风险管理",
    desc: "制定一套全面的品牌风险管理方案,帮助企业降低品牌风险,提升品牌的抗风险能力。",
    color: "bg-yellow-600",
  },
  {
    id: 10015,
    icon: "📅",
    title: "年度品牌战略计划",
    desc: "制定一份全面、系统的年度品牌战略计划,为客户提供具有针对性和可操作性的品牌发展建议。",
    color: "bg-pink-600",
  },
];

// ========== 市场分析模板 ==========
export const marketAnalysisTemplates = [
  {
    id: 10101,
    icon: "📊",
    title: "市场趋势报告",
    desc: "撰写一份全面、深入的市场趋势报告，为品牌策略的制定提供有力依据。",
    color: "bg-purple-500",
  },
  {
    id: 10102,
    icon: "🔍",
    title: "消费者行为研究",
    desc: "撰写一份详细的《消费者行为研究》报告，为品牌策略提供有力支持。",
    color: "bg-orange-500",
  },
  {
    id: 10103,
    icon: "📋",
    title: "品牌认知度调查",
    desc: "设计一份全面、科学的品牌认知度调查问卷，并对调查结果进行深入分析，为客户提供有价值的洞察。",
    color: "bg-red-500",
  },
  {
    id: 10104,
    icon: "📈",
    title: "品牌忠诚度测量",
    desc: "设计一套全面、科学的品牌忠诚度测量方案，为企业提供有价值的洞察和建议。",
    color: "bg-blue-500",
  },
  {
    id: 10105,
    icon: "📊",
    title: "市场细分报告",
    desc: "撰写一份详细、准确且具有可操作性的市场细分报告，为品牌策略的制定提供有力支持。",
    color: "bg-cyan-500",
  },
  {
    id: 10106,
    icon: "📉",
    title: "行业基准分析",
    desc: "撰写一份详细的行业基准分析报告，为客户的品牌策略提供有力支持。",
    color: "bg-green-500",
  },
  {
    id: 10107,
    icon: "💎",
    title: "品牌资产评估",
    desc: "完成一份全面、准确的品牌资产评估报告，为企业提供品牌发展的建议和方向。",
    color: "bg-pink-500",
  },
  {
    id: 10108,
    icon: "📱",
    title: "媒体消费习惯研究",
    desc: "完成一份全面的《媒体消费习惯研究》，为品牌策略提供有力支持。",
    color: "bg-indigo-500",
  },
  {
    id: 10109,
    icon: "⭐",
    title: "品牌影响力评估",
    desc: "撰写一份全面、准确的品牌影响力评估报告，为企业提供品牌发展的建议和方向。",
    color: "bg-yellow-500",
  },
  {
    id: 10110,
    icon: "🎯",
    title: "竞品分析报告",
    desc: "撰写一份详细、准确的竞品分析报告，为客户的品牌策略提供有力支持。",
    color: "bg-teal-500",
  },
  {
    id: 10111,
    icon: "🔄",
    title: "市场机会与威胁分析",
    desc: "撰写一份全面、深入的《市场机会与威胁分析》，为品牌策略的制定提供有力依据。",
    color: "bg-purple-600",
  },
  {
    id: 10112,
    icon: "📝",
    title: "SWOT分析报告",
    desc: "为客户提供一份详细、准确的 SWOT 分析报告，为品牌策略的制定提供有力支持。",
    color: "bg-green-600",
  },
  {
    id: 10113,
    icon: "🌍",
    title: "PESTLE分析报告",
    desc: "为客户提供一份详细、准确的 PESTLE 分析报告，为品牌策略的制定提供有力支持。",
    color: "bg-blue-600",
  },
];

// ========== 创意内容模板 ==========
export const creativeContentTemplates = [
  {
    id: 10201,
    icon: "🎯",
    title: "事件整合营销策划",
    desc: "通过整合营销策划开启品牌知名度，获取流量在客户和业绩转化。",
    color: "bg-green-500",
  },
  {
    id: 10202,
    icon: "💡",
    title: "创意概念提案",
    desc: "撰写一份全面且具有创新性的《创意概念提案》，为品牌提供独特的价值主张和传播策略。",
    color: "bg-orange-500",
  },
  {
    id: 10203,
    icon: "📝",
    title: "内容营销策略",
    desc: "制定一份全面、系统的内容营销策略，帮助客户实现品牌传播和营销目标。",
    color: "bg-yellow-500",
  },
  {
    id: 10204,
    icon: "📢",
    title: "广告创意简报",
    desc: "撰写一份详细且具有针对性的《广告创意简报》，为广告创意的生成提供明确的方向和指导。",
    color: "bg-purple-500",
  },
  {
    id: 10205,
    icon: "🎤",
    title: "品牌声音与语调指南",
    desc: "制定一份详细的《品牌声音与语调指南》，帮助品牌在各种传播渠道中保持一致的形象和风格。",
    color: "bg-blue-500",
  },
  {
    id: 10206,
    icon: "🎬",
    title: "品牌故事板与脚本",
    desc: "创作具有吸引力和感染力的品牌故事板与脚本，提升品牌的知名度和美誉度。",
    color: "bg-pink-500",
  },
  {
    id: 10207,
    icon: "📱",
    title: "社交媒体内容策略",
    desc: "制定一套全面且具有针对性的社交媒体内容策略，以实现品牌的营销目标。",
    color: "bg-indigo-500",
  },
  {
    id: 10208,
    icon: "🎉",
    title: "品牌活动创意方案",
    desc: "为客户制定具有吸引力和影响力的品牌活动创意方案，实现品牌传播和市场推广的目标。",
    color: "bg-cyan-500",
  },
  {
    id: 10209,
    icon: "👥",
    title: "用户生成内容(UGC)策略",
    desc: "制定一套全面的用户生成内容（UGC）策略，以提高品牌的影响力和用户参与度。",
    color: "bg-teal-500",
  },
];

// ========== 品牌视觉模板 ==========
export const brandVisualTemplates = [
  {
    id: 10301,
    icon: "🎨",
    title: "品牌标识设计规范",
    desc: "制定一套全面、详细且具有可操作性的《品牌标识设计规范》，确保品牌标识在各种应用场景中的一致性。",
    color: "bg-purple-500",
  },
  {
    id: 10302,
    icon: "🔤",
    title: "字体和色彩指南",
    desc: "制定一份详细的《字体和色彩指南》，为品牌提供明确的视觉规范。",
    color: "bg-blue-500",
  },
  {
    id: 10303,
    icon: "🖼️",
    title: "品牌图形元素库",
    desc: "构建一个全面、系统且具有可操作性的品牌图形元素库，以提升品牌的视觉识别力和市场竞争力。",
    color: "bg-orange-500",
  },
  {
    id: 10304,
    icon: "📦",
    title: "包装设计标准",
    desc: "制定一套详细、专业且具有可操作性的包装设计标准，以提升品牌形象和产品竞争力。",
    color: "bg-pink-500",
  },
  {
    id: 10305,
    icon: "👁️",
    title: "视觉识别系统(VIS)规范",
    desc: "制定一套完整、系统且符合品牌定位的视觉识别系统规范，确保品牌在市场上具有独特性和一致性。",
    color: "bg-indigo-500",
  },
  {
    id: 10306,
    icon: "💻",
    title: "网站UI/UX设计指南",
    desc: "制定一套全面、专业的网站 UI/UX 设计指南，帮助客户打造有效的网站引力，赢得用户和品牌。",
    color: "bg-cyan-500",
  },
  {
    id: 10307,
    icon: "📢",
    title: "广告创意简报",
    desc: "撰写一份详细、准确且具有可操作性的《广告创意简报》，为广告创意团队提供清晰的方向和指导。",
    color: "bg-green-500",
  },
  {
    id: 10308,
    icon: "📋",
    title: "品牌风格指南",
    desc: "为客户制定一份全面、详细且具有可操作性的《品牌风格指南》，确保品牌在市场上展现一致性。",
    color: "bg-teal-500",
  },
];

// ========== 媒介规划模板 ==========
export const mediaPlanningTemplates = [
  {
    id: 10401,
    icon: "📊",
    title: "媒体策略与计划",
    desc: "为客户制定全面、精准、有效的媒体策略与计划，提高品牌知名度和市场占有率。",
    color: "bg-orange-500",
  },
  {
    id: 10402,
    icon: "📅",
    title: "广告投放时间表",
    desc: "制定一份详细、科学的广告投放时间表，确保广告投放的效果最大化，提升品牌知名度和销售。",
    color: "bg-red-500",
  },
  {
    id: 10403,
    icon: "💰",
    title: "媒体预算分配",
    desc: "制定科学合理的媒体预算分配方案，提高品牌知名度和市场影响力。",
    color: "bg-green-500",
  },
  {
    id: 10404,
    icon: "📈",
    title: "媒体效果评估报告",
    desc: "撰写一份全面、准确的《媒体效果评估报告》，为客户提供有价值的媒体效果收益分析，以支持未来的媒体策略决策。",
    color: "bg-blue-500",
  },
  {
    id: 10405,
    icon: "💻",
    title: "数字媒体投放指南",
    desc: "编写一份全面、实用的数字媒体投放指南，通过自标识、平台选择、内容创作、投放策略等方面，帮助客户实现有效的数字媒体投放。",
    color: "bg-purple-500",
  },
  {
    id: 10406,
    icon: "📻",
    title: "广播与电视媒体计划",
    desc: "制定一份详细的广播与电视媒体计划，帮助客户实现品牌传播目标，提高品牌知名度和市场影响力。",
    color: "bg-pink-500",
  },
  {
    id: 10407,
    icon: "🚏",
    title: "户外广告位置选择",
    desc: "为客户提供科学合理的户外广告位置选择方案，提高品牌曝光度和传播效果。",
    color: "bg-cyan-500",
  },
  {
    id: 10408,
    icon: "🤝",
    title: "媒体合作与赞助提案",
    desc: "制定一份具有针对性和吸引力的《媒体合作与赞助提案》，帮助客户实现品牌传播和市场推广的目标。",
    color: "bg-indigo-500",
  },
  {
    id: 10409,
    icon: "📝",
    title: "媒体采购合同",
    desc: "制定一份详细、全面且符合双方利益的媒体采购合同。",
    color: "bg-teal-500",
  },
  {
    id: 10410,
    icon: "📊",
    title: "广告监测与优化报告",
    desc: "撰写一份详细的《广告监测与优化报告》，为客户提供广告效果的深度分析和优化建议，以提升广告投放的效率和效果。",
    color: "bg-yellow-500",
  },
  {
    id: 10411,
    icon: "🔄",
    title: "跨媒体整合营销策略",
    desc: "制定一套全面、系统的跨媒体整合营销策略，帮助客户实现品牌传播和市场推广的目标。",
    color: "bg-amber-500",
  },
];

// ========== 品牌维护模板 ==========
export const brandMaintenanceTemplates = [
  {
    id: 10501,
    icon: "📊",
    title: "品牌资产监测报告",
    desc: "撰写一份全面、准确的《品牌资产监测报告》，为客户提供品牌资产的深度分析和发展建议。",
    color: "bg-purple-500",
  },
  {
    id: 10502,
    icon: "💙",
    title: "品牌忠诚度分析",
    desc: "完成一份详细的《品牌忠诚度分析》，为客户提供提升品牌忠诚度的策略和建议。",
    color: "bg-blue-500",
  },
  {
    id: 10503,
    icon: "📋",
    title: "客户满意度调查",
    desc: "设计一份全面、科学的客户满意度调查问卷，准确了解客户对公司服务的满意度和需求。",
    color: "bg-cyan-500",
  },
  {
    id: 10504,
    icon: "🛡️",
    title: "品牌危机应对手册",
    desc: "编写一份全面、实用的《品牌危机应对手册》，为企业提供系统的危机应对指导。",
    color: "bg-red-500",
  },
  {
    id: 10505,
    icon: "📈",
    title: "品牌审计报告",
    desc: "撰写一份全面、深入的品牌审计报告，为品牌策略的制定提供有力依据。",
    color: "bg-pink-500",
  },
  {
    id: 10506,
    icon: "💎",
    title: "品牌价值评估",
    desc: "撰写一份全面、准确的《品牌价值评估》报告，为企业的品牌战略决策提供有力支持。",
    color: "bg-indigo-500",
  },
  {
    id: 10507,
    icon: "🔄",
    title: "品牌更新与重塑策略",
    desc: "制定一套全面的品牌更新与重塑策略，提升品牌竞争力和市场影响力。",
    color: "bg-orange-500",
  },
  {
    id: 10508,
    icon: "✅",
    title: "品牌一致性检查表",
    desc: "制定一份详细、全面的《品牌一致性检查表》，述品牌品牌的各个方面，以确保品牌在各种渠道和接触点上的一致性。",
    color: "bg-green-500",
  },
];

// ========== 内部培训模板 ==========
export const internalTrainingTemplates = [
  {
    id: 10601,
    icon: "📚",
    title: "品牌内部培训手册",
    desc: "编写一份详细且实用的《品牌内部培训手册》，帮助员工提升品牌策略方面的知识和技能。",
    color: "bg-orange-500",
  },
  {
    id: 10602,
    icon: "🎖️",
    title: "员工品牌大使计划",
    desc: "制定一套完善的《员工品牌大使计划》，提高员工对品牌的认知和忠诚度，增强员工的品牌意识。",
    color: "bg-red-500",
  },
  {
    id: 10603,
    icon: "🎯",
    title: "内部品牌意识活动",
    desc: "制定一套有效的内部品牌意识活动方案，增强员工对品牌的理解和认同。",
    color: "bg-purple-500",
  },
  {
    id: 10604,
    icon: "🏢",
    title: "企业文化和价值观文档",
    desc: "为客户撰写一份全面、深入且具有感染力的《企业文化和价值观文档》，以帮助企业更好地传播其文化和价值观。",
    color: "bg-green-500",
  },
  {
    id: 10605,
    icon: "📋",
    title: "员工行为准则",
    desc: "制定一套完善的《员工行为准则》，以规范员工工作中的行为，提升公司的品牌形象和社会责任感。",
    color: "bg-blue-500",
  },
];

// ========== 报告总结模板 ==========
export const reportSummaryTemplates = [
  {
    id: 10701,
    icon: "📊",
    title: "季度品牌表现报告",
    desc: "撰写一份全面、准确的季度品牌表现报告，为客户提供品牌发展的建议和方向。",
    color: "bg-pink-500",
  },
  {
    id: 10702,
    icon: "📅",
    title: "年度品牌回顾",
    desc: "撰写一份详细的《年度品牌回顾》，为品牌未来发展提供有价值的建议和方向。",
    color: "bg-purple-500",
  },
  {
    id: 10703,
    icon: "🏆",
    title: "项目后评估报告",
    desc: "撰写一份详细、准确的《项目后评估报告》，为客户提供项目的全面性和进展性评估。",
    color: "bg-cyan-500",
  },
  {
    id: 10704,
    icon: "📈",
    title: "活动效果分析",
    desc: "撰写一份详细的《活动效果分析》报告，为品牌策略提供有价值的优化建议。",
    color: "bg-blue-500",
  },
  {
    id: 10705,
    icon: "📰",
    title: "媒体监测和舆报",
    desc: "编写一份详细的《媒体监测和舆报》，为客户提供全面的媒体监测和舆情分析，以支持品牌策略的制定和优化。",
    color: "bg-green-500",
  },
];

// ========== 创新规划模板 ==========
export const innovationPlanningTemplates = [
  {
    id: 10801,
    icon: "💡",
    title: "新产品或服务概念文档",
    desc: "撰写一份详细、全面且具有可行性的《新产品或服务概念文档》，为产品或服务的成功推出奠定基础。",
    color: "bg-pink-500",
  },
  {
    id: 10802,
    icon: "🔬",
    title: "品牌创新实验室报告",
    desc: "撰写一份详细的《品牌创新实验室报告》，为客户提供品牌创新的方向和建议。",
    color: "bg-purple-500",
  },
  {
    id: 10803,
    icon: "🔮",
    title: "未来趋势预测",
    desc: "撰写一份全面且具有前瞻性的《未来趋势预测》，为品牌策略的制定提供有力支持。",
    color: "bg-blue-500",
  },
  {
    id: 10804,
    icon: "💻",
    title: "品牌科技整合策略",
    desc: "制定一套全面的《品牌科技整合策略》，帮助品牌在数字时代保持竞争力和实现可持续发展。",
    color: "bg-cyan-500",
  },
  {
    id: 10805,
    icon: "🌱",
    title: "可持续性和ESG策略",
    desc: "为客户制定一份全面的可持续性和 ESG 品牌策略，提高品牌的社会责任感和市场竞争力。",
    color: "bg-green-500",
  },
];

// ========== 法律合规模板 ==========
export const legalComplianceTemplates = [
  {
    id: 10901,
    icon: "⚖️",
    title: "商标注册和维护",
    desc: "为客户提供全面的商标注册和维护方案，确保商标的合法性和有效性，提升品牌的法律保护力度。",
    color: "bg-purple-500",
  },
  {
    id: 10902,
    icon: "📜",
    title: "版权和知识产权管理",
    desc: "制定一套完善的《版权和知识产权管理》方案，确保公司在品牌策略实施过程中遵守相关法律法规。",
    color: "bg-green-500",
  },
  {
    id: 10903,
    icon: "📢",
    title: "广告合规指南",
    desc: "编写一份详细的《广告合规指南》，为4A广告公司的品牌策略提供法律依据和指导。",
    color: "bg-orange-500",
  },
  {
    id: 10904,
    icon: "🔒",
    title: "数据保护和隐私政策",
    desc: "制定一份全面、各种法规的数据保护和隐私政策，保护用户数据安全，维护品牌形象。",
    color: "bg-blue-500",
  },
  {
    id: 10905,
    icon: "📊",
    title: "法律风险评估报告",
    desc: "撰写一份详细的《法律风险评估报告》，为品牌策略的制定提供法律依据和风险防范建议。",
    color: "bg-pink-500",
  },
  {
    id: 10906,
    icon: "📋",
    title: "广告法规与政策",
    desc: "撰写一份全面的《广告法规与政策》文档，为4A广告公司的品牌策略提供法律依据和指导。",
    color: "bg-red-500",
  },
  {
    id: 10907,
    icon: "📄",
    title: "合同与协议模板",
    desc: "设计一套完整、详细且符合行业标准的合同与协议模板，用于4A广告公司的品牌策略实施过程中的各种商业合作。",
    color: "bg-cyan-500",
  },
  {
    id: 10908,
    icon: "🔐",
    title: "隐私政策声明",
    desc: "撰写一份全面、清晰、符合法律法规的隐私政策声明，为客户的品牌策略提供法律保障和用户信任。",
    color: "bg-indigo-500",
  },
  {
    id: 10909,
    icon: "🛡️",
    title: "数据保护合规指南",
    desc: "编写一份全面的《数据保护合规指南》，为4A广告公司的品牌策略提供数据保护方面的法律指导和实践建议。",
    color: "bg-teal-500",
  },
  {
    id: 10910,
    icon: "⚠️",
    title: "法律风险评估",
    desc: "撰写一份全面、准确的法律风险评估报告，为品牌策略的制定提供法律依据和风险防范建议。",
    color: "bg-yellow-500",
  },
  {
    id: 10911,
    icon: "📞",
    title: "法律咨询服务记录",
    desc: "编写详细准确的法律咨询服务记录，为品牌策略提供法律依据和支持。",
    color: "bg-amber-500",
  },
  {
    id: 10912,
    icon: "🚨",
    title: "侵权案件应对计划",
    desc: "制定全面的侵权案件应对计划，最大程度减少品牌损失并维护品牌形象。",
    color: "bg-red-600",
  },
];

// ========== 创意策略模板 ==========
export const creativeStrategyTemplates = [
  {
    id: 11001,
    icon: "📋",
    title: "创意简报",
    desc: "撰写一份详细且具有创新性的《创意简报》，为客户提供创意方向和策略指导。",
    color: "bg-purple-500",
  },
  {
    id: 11002,
    icon: "💡",
    title: "创意策略提案",
    desc: "撰写一份全面、有针对性的《创意策略提案》，为客户提供创新的广告创意策略方案。",
    color: "bg-pink-500",
  },
  {
    id: 11003,
    icon: "📄",
    title: "品牌定位文档",
    desc: "撰写一份详细、准确且具有可操作性的《品牌定位文档》，为广告营销提供核心定位基础。",
    color: "bg-blue-500",
  },
  {
    id: 11004,
    icon: "📢",
    title: "传播策略提案",
    desc: "撰写一份全面、创新且具有可操作性的传播策略提案，以提升品牌影响力和市场占有率。",
    color: "bg-orange-500",
  },
  {
    id: 11005,
    icon: "📝",
    title: "创意概念提案",
    desc: "撰写一份具有创新性和吸引力的《创意概念提案》，提升广告创意的独特性和市场竞争力。",
    color: "bg-indigo-500",
  },
  {
    id: 11006,
    icon: "📅",
    title: "年度创意计划",
    desc: "制定一份全面、系统的年度创意计划，为客户提供整年的创意策略方案，提升品牌影响力和市场竞争力。",
    color: "bg-cyan-500",
  },
  {
    id: 11007,
    icon: "📋",
    title: "创意流程指南",
    desc: "制定详细的广告创意流程指南，帮助团队提高创意质量和效率，确保广告创意的顺利实施。",
    color: "bg-teal-500",
  },
  {
    id: 11008,
    icon: "🔄",
    title: "创意工作流程图",
    desc: "设计一个详细的《创意工作流程图》，确保广告创意团队能够高效协作，提升广告创意的质量和效率。",
    color: "bg-purple-600",
  },
  {
    id: 11009,
    icon: "✅",
    title: "创意审核清单",
    desc: "制定一份详细且全面的《创意审核清单》，确保广告创意团队在创意过程中遵循最佳实践和质量标准。",
    color: "bg-pink-600",
  },
  {
    id: 11010,
    icon: "🏆",
    title: "创意会议纪要",
    desc: "撰写一份全面、准确的《创意会议纪要》，为广告创意团队提供清晰的会议记录和后续行动指导。",
    color: "bg-yellow-500",
  },
  {
    id: 11011,
    icon: "🧠",
    title: "创意思维导图",
    desc: "设计一份详细的《创意思维导图》，为广告创意团队提供全面的创意结构和思路指导。",
    color: "bg-green-500",
  },
  {
    id: 11012,
    icon: "📊",
    title: "竞品分析报告",
    desc: "撰写一份详细、准确的竞品分析报告，为广告创意提供有力支持。",
    color: "bg-blue-600",
  },
  {
    id: 11013,
    icon: "📈",
    title: "市场趋势分析",
    desc: "撰写一份全面、深入的市场趋势分析报告，为广告创意提供有力依据。",
    color: "bg-red-500",
  },
  {
    id: 11014,
    icon: "🔮",
    title: "创新趋势报告",
    desc: "撰写一份全面、深入的《创新趋势报告》，为4A广告公司的广告创意提供有力支持。",
    color: "bg-amber-500",
  },
];

// ========== 设计视觉模板 ==========
export const designVisualTemplates = [
  {
    id: 11101,
    icon: "💡",
    title: "品牌视觉识别系统(VIS)",
    desc: "为客户打造一套完整、系统的品牌视觉识别系统，提升品牌的视觉识别力和市场竞争力。",
    color: "bg-purple-500",
  },
  {
    id: 11102,
    icon: "🎨",
    title: "设计风格指南",
    desc: "编写一份详细且实用的《设计风格指南》，为广告创意团队提供明确的设计规范和指导。",
    color: "bg-pink-500",
  },
  {
    id: 11103,
    icon: "📐",
    title: "广告设计规范",
    desc: "制定一套全面的《广告设计规范》，确保广告创意的视觉效果和品牌一致性。",
    color: "bg-blue-500",
  },
  {
    id: 11104,
    icon: "🖼️",
    title: "图形元素库文档",
    desc: "编写一份详细且实用的《图形元素库文档》，为广告创意团队提供丰富的视觉资源和使用指南。",
    color: "bg-orange-500",
  },
  {
    id: 11105,
    icon: "🎨",
    title: "字体与色彩指南",
    desc: "编写一份详细的《字体与色彩指南》，为广告创意团队提供专业的排版和配色指导。",
    color: "bg-indigo-500",
  },
  {
    id: 11106,
    icon: "📦",
    title: "品牌包装设计标准",
    desc: "制定一套全面、系统且具有创新性的《品牌包装设计标准》，以提升产品吸引力和品牌竞争力。",
    color: "bg-cyan-500",
  },
  {
    id: 11107,
    icon: "💻",
    title: "UI/UX设计指南",
    desc: "编写一份详细且实用的《UI/UX设计指南》，帮助团队成员更好地理解和应用UI/UX设计原则。",
    color: "bg-teal-500",
  },
  {
    id: 11108,
    icon: "📄",
    title: "广告版面布局指南",
    desc: "制定详细的广告版面布局指南，帮助广告创意团队提高广告的吸引力和效果。",
    color: "bg-green-500",
  },
  {
    id: 11109,
    icon: "📷",
    title: "摄影与影像使用准则",
    desc: "制定一套详细且实用的《摄影与影像使用准则》，以规范和指导广告创意中的摄影与影像使用。",
    color: "bg-purple-600",
  },
];

// ========== 创意开发模板 ==========
export const creativeDevelopmentTemplates = [
  {
    id: 11201,
    icon: "🎬",
    title: "故事板与脚本",
    desc: "创作高质量的故事板与脚本，以提升广告创意的吸引力和传播效果。",
    color: "bg-pink-500",
  },
  {
    id: 11202,
    icon: "📝",
    title: "文案创意简报",
    desc: "撰写一份详细、准确的文案创意简报，为广告创意的产生提供实支持。",
    color: "bg-blue-500",
  },
  {
    id: 11203,
    icon: "✍️",
    title: "广告文案草案",
    desc: "撰写一份具有吸引力和感染力的广告文案草案，准确且生动地呈现广告产品信息，激发消费者购买欲望。",
    color: "bg-purple-500",
  },
  {
    id: 11204,
    icon: "🎨",
    title: "视觉概念草图",
    desc: "创作一份能够清晰展现广告主题和核心信息的视觉概念草图，为广告的成功制作奠定坚实基础。",
    color: "bg-orange-500",
  },
  {
    id: 11205,
    icon: "📄",
    title: "文案创作稿",
    desc: "创作出具有吸引力、感染力和说服性的文案，有效达成品牌传播和产品信息。",
    color: "bg-indigo-500",
  },
  {
    id: 11206,
    icon: "📋",
    title: "设计规范手册",
    desc: "编写一份详细且实用的《设计规范手册》，为广告创意团队提供统一的设计标准和指导。",
    color: "bg-cyan-500",
  },
  {
    id: 11207,
    icon: "🎬",
    title: "广告脚本",
    desc: "创作一个具有吸引力和感染力的广告脚本，能够有效传达产品或品牌的核心信息，提升品牌知名度。",
    color: "bg-teal-500",
  },
  {
    id: 11208,
    icon: "💬",
    title: "广告标语",
    desc: "为客户创作具有吸引力、结合性和记忆性的广告标语，提升品牌知名度和影响力。",
    color: "bg-green-500",
  },
  {
    id: 11209,
    icon: "🎥",
    title: "视频拍摄计划",
    desc: "制定一份详细且具有可操作性的视频拍摄计划，确保广告视频的顺利拍摄和高质量完成。",
    color: "bg-yellow-500",
  },
  {
    id: 11210,
    icon: "📸",
    title: "摄影指南",
    desc: "编写一份详细的《摄影指南》，涵盖广告摄影的方方面面，帮助摄影师们拍摄出更好的广告作品。",
    color: "bg-pink-600",
  },
  {
    id: 11211,
    icon: "🎵",
    title: "音乐与音效说明",
    desc: "撰写一份详细且专业的《音乐与音效说明》，以提升广告的整体效果。",
    color: "bg-purple-600",
  },
];

// ========== 项目管理模板 ==========
export const projectManagementTemplates = [
  {
    id: 11301,
    icon: "📋",
    title: "项目启动文档",
    desc: "撰写一份详细的《项目启动文档》，涵盖项目背景、目标、创意策略、执行计划等方面。",
    color: "bg-blue-500",
  },
  {
    id: 11302,
    icon: "📊",
    title: "项目进度报告",
    desc: "撰写一份详细、准确的广告创意项目进度报告，反映项目的当前状态和未来发展趋势。",
    color: "bg-purple-500",
  },
  {
    id: 11303,
    icon: "💰",
    title: "项目预算与成本控制",
    desc: "制定详细的《项目预算与成本控制》方案，确保广告创意项目在预算范围内顺利完成，并提高成本效益。",
    color: "bg-pink-500",
  },
  {
    id: 11304,
    icon: "📊",
    title: "资源分配表",
    desc: "制定一份详细且合理的《资源分配表》，确保广告创意项目的各个环节都能获得充分的资源支持。",
    color: "bg-orange-500",
  },
  {
    id: 11305,
    icon: "👥",
    title: "任务分配与责任矩阵",
    desc: "制定一份详细的《任务分配与责任矩阵》，确保广告创意团队的各个环节都有明确的责任人。",
    color: "bg-indigo-500",
  },
  {
    id: 11306,
    icon: "📝",
    title: "团队会议议程与纪要",
    desc: "制定详细的团队会议议程与纪要，确保会议高效进行，促进广告创意的顺利实施。",
    color: "bg-cyan-500",
  },
  {
    id: 11307,
    icon: "💬",
    title: "客户沟通记录",
    desc: "设计一个能够详细记录客户沟通内容和需求的《客户沟通记录》模板。",
    color: "bg-teal-500",
  },
  {
    id: 11308,
    icon: "📋",
    title: "外包供应商管理文档",
    desc: "制定一份完善的《外包供应商管理文档》，规范外包供应商的管理流程，提高广告创意的质量和效率。",
    color: "bg-green-500",
  },
  {
    id: 11309,
    icon: "📝",
    title: "项目变更请求表",
    desc: "设计一份详细且规范的《项目变更请求表》，确保项目变更的合理性和可控性。",
    color: "bg-yellow-500",
  },
  {
    id: 11310,
    icon: "⚠️",
    title: "项目风险评估报告",
    desc: "完成一份详细、准确的广告创意项目风险评估报告，为项目决策提供有力支持。",
    color: "bg-red-500",
  },
];

// ========== 培训发展模板 ==========
export const trainingDevelopmentTemplates = [
  {
    id: 11401,
    icon: "🎯",
    title: "团队建设活动计划",
    desc: "制定一份详细的团队建设活动计划，提升广告创意团队的协作能力和创新思维。",
    color: "bg-purple-500",
  },
  {
    id: 11402,
    icon: "📚",
    title: "员工培训手册",
    desc: "编写一份全面、系统的员工培训手册，帮助员工提升广告创意能力。",
    color: "bg-orange-500",
  },
  {
    id: 11403,
    icon: "💡",
    title: "创意技巧提升课程大纲",
    desc: "帮助学员提高各种广告创意技巧，提高创意水平，培养创新思维，能够独立创作出具有吸引力的广告作品。",
    color: "bg-pink-500",
  },
  {
    id: 11404,
    icon: "📊",
    title: "团队绩效评估报告",
    desc: "撰写一份全面、客观的《团队绩效评估报告》，为团队的发展提供有力的参考和建议。",
    color: "bg-blue-500",
  },
  {
    id: 11405,
    icon: "🎯",
    title: "个人职业发展规划",
    desc: "制定一份全面的个人职业发展规划，明确职业目标和发展路径。",
    color: "bg-indigo-500",
  },
  {
    id: 11406,
    icon: "🏆",
    title: "员工激励与认可计划",
    desc: "设计一个全面的员工激励与认可计划，以提升广告创意团队的绩效和创造力。",
    color: "bg-cyan-500",
  },
  {
    id: 11407,
    icon: "👥",
    title: "创意人才招聘标准",
    desc: "制定一套科学、合理、全面的创意人才招聘标准，为公司招聘到符合要求的优秀创意人才。",
    color: "bg-teal-500",
  },
  {
    id: 11408,
    icon: "📈",
    title: "创意团队KPI设定",
    desc: "制定一套科学合理的创意团队KPI设定方案，以提升团队的创意水平和工作效率。",
    color: "bg-green-500",
  },
  {
    id: 11409,
    icon: "⭐",
    title: "员工技能与能力评估",
    desc: "制定一套全面、客观、准确的员工技能与能力评估方案，为公司的人才发展和团队建设提供支持。",
    color: "bg-yellow-500",
  },
];

// ========== 绩效评估模板 ==========
export const performanceEvaluationTemplates = [
  {
    id: 11501,
    icon: "📊",
    title: "项目后评估报告",
    desc: "撰写一份详细的《项目后评估报告》，对广告创意的各个方面进行评估和分析。",
    color: "bg-purple-500",
  },
  {
    id: 11502,
    icon: "🎨",
    title: "创意表现分析",
    desc: "撰写一份详细的《创意表现分析》，为广告创意的改进和优化提供依据。",
    color: "bg-pink-500",
  },
  {
    id: 11503,
    icon: "📈",
    title: "KPI追踪与分析",
    desc: "制定一套完善的KPI追踪与分析方案，以提升广告创意的效果和价值。",
    color: "bg-orange-500",
  },
  {
    id: 11504,
    icon: "📅",
    title: "年度绩效总结",
    desc: "完成一份全面、客观的年度绩效总结，为公司的广告创意业务发展提供参考。",
    color: "bg-blue-500",
  },
  {
    id: 11505,
    icon: "📋",
    title: "创意项目案例集",
    desc: "编写一份全面、详细的《创意项目案例集》，展示公司的创意成果和专业能力。",
    color: "bg-indigo-500",
  },
  {
    id: 11506,
    icon: "😊",
    title: "客户满意度指数报告",
    desc: "撰写一份详细、准确的客户满意度指数报告，为公司改进广告创意服务提供依据。",
    color: "bg-cyan-500",
  },
];

// ========== 市场调研模板 ==========
export const marketResearchTemplates = [
  {
    id: 11601,
    icon: "📊",
    title: "市场研究报告",
    desc: "撰写一份详细、准确且具有洞察力的市场研究报告，为广告创意提供有力支持。",
    color: "bg-pink-500",
  },
  {
    id: 11602,
    icon: "👥",
    title: "消费者洞察报告",
    desc: "撰写一份详细且有深度的消费者洞察报告，为广告创意提供有力的决策支持。",
    color: "bg-purple-500",
  },
  {
    id: 11603,
    icon: "⚔️",
    title: "竞争对手分析",
    desc: "撰写一份详细的《竞争对手分析》报告，为广告创意提供有参考价值。",
    color: "bg-blue-500",
  },
  {
    id: 11604,
    icon: "🎯",
    title: "品牌认知度研究",
    desc: "完成一份详细的《品牌认知度研究》报告，为广告创意提供品牌影响力支持。",
    color: "bg-indigo-500",
  },
  {
    id: 11605,
    icon: "📈",
    title: "营销效果分析",
    desc: "撰写一份详细的《营销效果分析》报告，准确评估广告活动的效果，并提出改进建议。",
    color: "bg-green-500",
  },
  {
    id: 11606,
    icon: "🔮",
    title: "行业趋势预测",
    desc: "撰写一份全面且具有前瞻性的行业趋势预测，为广告创意提供有力的指导。",
    color: "bg-orange-500",
  },
];

// ========== 创新趋势模板 ==========
export const innovationTrendsTemplates = [
  {
    id: 11701,
    icon: "💡",
    title: "创新思维工作坊计划",
    desc: "设计一个能够激发团队创新思维，提升广告创意能力的工作坊计划。",
    color: "bg-purple-500",
  },
  {
    id: 11702,
    icon: "🔧",
    title: "新技术应用案例",
    desc: "撰写一份详细的《新技术应用案例》，为广告公司的创意团队提供参考和启迪。",
    color: "bg-pink-500",
  },
  {
    id: 11703,
    icon: "🏆",
    title: "未来趋势研讨会记录",
    desc: "撰写一份详细的《未来趋势研讨会记录》，为广告创意团队提供有价值的参考。",
    color: "bg-indigo-500",
  },
  {
    id: 11704,
    icon: "🌟",
    title: "创新项目提案",
    desc: "撰写一份具有创新性和可行性的《创新项目提案》，为客户提供独特的广告创意方案。",
    color: "bg-green-500",
  },
  {
    id: 11705,
    icon: "🔬",
    title: "创新实验报告",
    desc: "撰写一份详细的《创新实验报告》，总结广告创意的创新实践结果，为公司的创新工作提供参考。",
    color: "bg-blue-500",
  },
];

// ========== 客户关系模板 ==========
export const customerRelationsTemplates = [
  {
    id: 11801,
    icon: "📊",
    title: "客户需求分析报告",
    desc: "撰写一份详细且准确的《客户需求分析报告》，为后续的广告创意提供有力支持。",
    color: "bg-purple-500",
  },
  {
    id: 11802,
    icon: "📋",
    title: "客户满意度调查",
    desc: "设计一份全面、科学的客户满意度调查问卷，分析调查结果，提出改进建议。",
    color: "bg-pink-500",
  },
  {
    id: 11803,
    icon: "📄",
    title: "客户提案与演示材料",
    desc: "制作一份具有吸引力和说服力的《客户提案与演示材料》，成功向客户传达广告创意概念。",
    color: "bg-indigo-500",
  },
  {
    id: 11804,
    icon: "✅",
    title: "客户反馈与改进计划",
    desc: "撰写一份详细的《客户反馈与改进计划》，以提升广告创意的质量和客户满意度。",
    color: "bg-blue-500",
  },
  {
    id: 11805,
    icon: "💼",
    title: "客户关系维护计划",
    desc: "制定一份详细的《客户关系维护计划》，确保客户满意度和忠诚度的提升，促进长期合作。",
    color: "bg-pink-600",
  },
  {
    id: 11806,
    icon: "💡",
    title: "客户案例研究",
    desc: "撰写一份详细且有深度的《客户案例研究》，展示广告创意的过程、效果和价值。",
    color: "bg-cyan-500",
  },
  {
    id: 11807,
    icon: "🎯",
    title: "客户成功故事",
    desc: "撰写一篇能够吸引读者关注的《客户成功故事》，突出客户成功的关键，提升广告创意的影响力。",
    color: "bg-teal-500",
  },
  {
    id: 11808,
    icon: "📝",
    title: "客户投诉处理记录",
    desc: "撰写详细、准确的客户投诉处理记录，以便及时解决问题，提升客户满意度。",
    color: "bg-orange-500",
  },
];

// ========== 财务预算模板 ==========
export const financialBudgetTemplates = [
  {
    id: 11901,
    icon: "💰",
    title: "预算编制与审批",
    desc: "制定详细且合理的广告项目预算编制与审批流程，确保项目在预算范围内顺利完成。",
    color: "bg-purple-500",
  },
  {
    id: 11902,
    icon: "📊",
    title: "成本效益分析",
    desc: "撰写一份详细的《成本效益分析》报告，为广告创意提供有力依据。",
    color: "bg-pink-500",
  },
  {
    id: 11903,
    icon: "📋",
    title: "财务报告与审计",
    desc: "编写一份详细且准确的财务报告，并进行有效的审计，为广告创意项目提供财务方面的支持。",
    color: "bg-indigo-500",
  },
  {
    id: 11904,
    icon: "💡",
    title: "创意成本控制策略",
    desc: "制定一套全面的创意成本控制策略，确保广告创意项目在预算范围内高效完成。",
    color: "bg-green-500",
  },
  {
    id: 11905,
    icon: "📝",
    title: "预算调整申请",
    desc: "成功撰写《预算调整申请》，使预算调整得到批准，确保广告创意项目的顺利进行。",
    color: "bg-blue-500",
  },
  {
    id: 11906,
    icon: "💵",
    title: "收支明细表",
    desc: "制作详细且准确的《收支明细表》，为广告创意项目的财务管理提供支持。",
    color: "bg-cyan-500",
  },
];

// ========== 法律合规模板（创意）==========
export const legalComplianceCreativeTemplates = [
  {
    id: 12201,
    icon: "⚖️",
    title: "版权与许可协议",
    desc: "撰写一份全面、详细且符合法律法规的《版权与许可协议》，确保广告创意的版权归属。",
    color: "bg-blue-500",
  },
  {
    id: 12202,
    icon: "📋",
    title: "广告审查与合规性检查",
    desc: "制定详细的广告审查与合规性检查流程，确保广告符合相关法律法规和道德标准，降低法律风险。",
    color: "bg-purple-500",
  },
  {
    id: 12203,
    icon: "🔒",
    title: "隐私政策与数据保护",
    desc: "制定一份完善的《隐私政策与数据保护》文档，确保广告创意活动中的数据收集和使用符合法律法规。",
    color: "bg-green-500",
  },
  {
    id: 12204,
    icon: "⚠️",
    title: "法律风险评估报告",
    desc: "撰写一份详细的《法律风险评估报告》，为4A广告公司的广告创意提供法律风险评估。",
    color: "bg-orange-500",
  },
  {
    id: 12205,
    icon: "📖",
    title: "商标使用指南",
    desc: "编写一份详细且专业的《商标使用指南》，确保广告创意中的商标使用符合法律规范。",
    color: "bg-indigo-500",
  },
  {
    id: 12206,
    icon: "📜",
    title: "广告法规遵循指南",
    desc: "编写一份详细的《广告法规遵循指南》，为4A广告公司的广告创意提供明确的法律指导。",
    color: "bg-pink-500",
  },
];

// ========== 技术工具模板 ==========
export const technicalToolsTemplates = [
  {
    id: 12301,
    icon: "💻",
    title: "软件与硬件使用指南",
    desc: "编写一份详细的《软件与硬件使用指南》，帮助广告创意团队成员更好地利用软件与硬件工具。",
    color: "bg-green-500",
  },
  {
    id: 12302,
    icon: "🔧",
    title: "技术解决方案文档",
    desc: "撰写一份详细的《技术解决方案文档》，为广告创意提供实现技术支持指南。",
    color: "bg-blue-500",
  },
  {
    id: 12303,
    icon: "📚",
    title: "创意工具培训手册",
    desc: "编写一份详细的《创意工具培训手册》，帮助员工掌握创意工具的使用方法和技巧。",
    color: "bg-purple-500",
  },
  {
    id: 12304,
    icon: "📊",
    title: "技术支持请求表",
    desc: "设计一个详细且合理的《技术支持请求表》，确保团队能够清晰地描述广告创意的需求。",
    color: "bg-indigo-500",
  },
  {
    id: 12305,
    icon: "🔧",
    title: "技术故障报告",
    desc: "撰写一份详细且准确的《技术故障报告》，为解决技术问题提供依据，保障广告创意的顺利进行。",
    color: "bg-pink-500",
  },
];

// ========== 媒介模板 ==========
export const mediaTemplates = [
  {
    id: 13001,
    icon: "📺",
    title: "媒介策略规划",
    desc: "制定全面的媒介策略,优化媒介资源配置。",
    color: "bg-blue-500",
  },
  {
    id: 13002,
    icon: "📊",
    title: "媒介效果评估",
    desc: "建立媒介效果评估体系,提升媒介投放ROI。",
    color: "bg-green-500",
  },
];

// ========== 活动策划模板 ==========
export const activityTemplates = [
  {
    id: 14001,
    icon: "🎉",
    title: "活动策划方案",
    desc: "设计完整的活动策划方案,确保活动顺利执行。",
    color: "bg-purple-500",
  },
  {
    id: 14002,
    icon: "📅",
    title: "活动执行计划",
    desc: "制定详细的活动执行计划,保障活动效果落地。",
    color: "bg-indigo-500",
  },
];

// ========== 调研模板 ==========
export const researchTemplates = [
  {
    id: 15001,
    icon: "🔍",
    title: "市场调研方案",
    desc: "设计科学的市场调研方案,获取准确的市场信息。",
    color: "bg-cyan-500",
  },
  {
    id: 15002,
    icon: "📊",
    title: "用户调研分析",
    desc: "开展深入的用户调研,洞察用户需求和行为。",
    color: "bg-teal-500",
  },
];

// ========== 公关传播模板 ==========
export const prTemplates = [
  {
    id: 16001,
    icon: "📢",
    title: "公关传播策略",
    desc: "制定有效的公关传播策略,提升品牌公众形象。",
    color: "bg-orange-500",
  },
  {
    id: 16002,
    icon: "📰",
    title: "新闻稿撰写",
    desc: "撰写专业的新闻稿,扩大品牌传播影响力。",
    color: "bg-amber-500",
  },
];

// ========== 流量投放模板 ==========
export const trafficTemplates = [
  {
    id: 17001,
    icon: "🎯",
    title: "流量投放策略",
    desc: "制定精准的流量投放策略,提升投放转化率。",
    color: "bg-red-500",
  },
  {
    id: 17002,
    icon: "📈",
    title: "投放数据分析",
    desc: "分析投放数据,优化投放效果和ROI。",
    color: "bg-pink-500",
  },
];

// ========== 游戏推广模板 ==========
export const gameTemplates = [
  {
    id: 18001,
    icon: "🎮",
    title: "游戏推广方案",
    desc: "设计游戏推广方案,提升游戏下载和活跃度。",
    color: "bg-purple-500",
  },
  {
    id: 18002,
    icon: "🏆",
    title: "游戏活动策划",
    desc: "策划游戏营销活动,增强用户粘性和付费率。",
    color: "bg-indigo-500",
  },
];

// ========== B2B营销管理模板 ==========
export const b2bManagementTemplates = [
  {
    id: 19001,
    icon: "🏢",
    title: "B2B营销战略",
    desc: "制定B2B营销战略,提升企业客户获取能力。",
    color: "bg-blue-600",
  },
  {
    id: 19002,
    icon: "📊",
    title: "销售漏斗管理",
    desc: "优化销售漏斗管理,提高客户转化效率。",
    color: "bg-cyan-600",
  },
];

// ========== B2B数字营销模板 ==========
export const b2bDigitalTemplates = [
  {
    id: 20001,
    icon: "💻",
    title: "数字营销策略",
    desc: "制定B2B数字营销策略,拓展线上获客渠道。",
    color: "bg-green-600",
  },
  {
    id: 20002,
    icon: "📱",
    title: "营销自动化方案",
    desc: "设计营销自动化方案,提升营销效率和效果。",
    color: "bg-teal-600",
  },
];

// ========== B2B内容营销模板 ==========
export const b2bContentTemplates = [
  {
    id: 21001,
    icon: "📝",
    title: "内容营销策略",
    desc: "制定B2B内容营销策略,建立行业思想领导力。",
    color: "bg-purple-600",
  },
  {
    id: 21002,
    icon: "📄",
    title: "白皮书撰写",
    desc: "撰写专业白皮书,展示企业专业能力和解决方案。",
    color: "bg-indigo-600",
  },
];

// ========== B2B活动营销模板 ==========
export const b2bActivityTemplates = [
  {
    id: 22001,
    icon: "🎪",
    title: "B2B活动策划",
    desc: "策划B2B营销活动,促进客户关系和商机转化。",
    color: "bg-orange-600",
  },
  {
    id: 22002,
    icon: "🤝",
    title: "线下展会方案",
    desc: "制定线下展会参展方案,提升品牌曝光和客户获取。",
    color: "bg-amber-600",
  },
];
