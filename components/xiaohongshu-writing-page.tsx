"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Video,
  Newspaper,
  PenTool,
  Briefcase,
  Calendar,
  Target,
  FileCheck,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import { historyStorage, HistoryItem } from "@/lib/history-storage";
import {
  xiaohongshuTemplates,
  wechatTemplates,
  toutiaoTemplates,
  weiboTemplates,
  zhihuTemplates,
  privateTemplates,
} from "@/components/media-page"; // 从media-page导入模板数据

// 顶部筛选标签
const topFilters = [
  { id: "hot", label: "热门写作" },
  { id: "favorite", label: "收藏最多" },
  { id: "newest", label: "最新推出" },
  { id: "featured", label: "平台精选" },
];

// 左侧写作模板列表
const sideTemplates = [
  {
    id: 1,
    icon: "xiaohongshu",
    iconBg: "bg-red-500",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意...",
    active: true,
  },
  {
    id: 2,
    icon: "report",
    iconBg: "bg-emerald-500",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有...",
    active: false,
  },
  {
    id: 3,
    icon: "wechat",
    iconBg: "bg-green-500",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章...",
    active: false,
  },
  {
    id: 4,
    icon: "video",
    iconBg: "bg-amber-500",
    title: "短视频爆款文案",
    desc: "设计能够迅速吸引观众注...",
    active: false,
  },
  {
    id: 5,
    icon: "toutiao",
    iconBg: "bg-red-600",
    title: "头条爆文",
    desc: "帮助用户创作出能够吸引...",
    active: false,
  },
  {
    id: 6,
    icon: "title",
    iconBg: "bg-red-500",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众...",
    active: false,
  },
  {
    id: 7,
    icon: "business",
    iconBg: "bg-purple-500",
    title: "商业计划书",
    desc: "为客户撰写一份详细、全...",
    active: false,
  },
  {
    id: 8,
    icon: "weekly",
    iconBg: "bg-orange-500",
    title: "周/月/季度工作总结",
    desc: "为用户提供详细、实用的...",
    active: false,
  },
  {
    id: 9,
    icon: "hook",
    iconBg: "bg-amber-500",
    title: "短视频黄金3秒开头",
    desc: "设计出能够迅速吸引观众...",
    active: false,
  },
];

// 示例提问 - 根据模板ID动态显示
const examplePromptsByTemplate: Record<string, string[]> = {
  // 小红书爆款文案 (templateId = "1" 或 "102")
  "1": [
    "我是一名时尚博主，想要创作一篇关于秋季穿搭的小红书笔记，目标受众是25-35岁的都市女性",
    "我开了一家咖啡店，想要在小红书上分享我们的特色拿铁和店铺氛围，吸引年轻人打卡",
    "我是护肤达人，想要分享一套适合干皮的冬季护肤routine，需要专业又接地气的文案"
  ],
  "102": [
    "我是一名时尚博主，想要创作一篇关于秋季穿搭的小红书笔记，目标受众是25-35岁的都市女性",
    "我开了一家咖啡店，想要在小红书上分享我们的特色拿铁和店铺氛围，吸引年轻人打卡",
    "我是护肤达人，想要分享一套适合干皮的冬季护肤routine，需要专业又接地气的文案"
  ],
  // 小红书爆款标题 (templateId = "6" 或 "103")
  "6": [
    "我写了一篇关于日本京都旅游攻略的笔记，内容包括小众景点、美食推荐和省钱技巧，帮我设计吸引人的标题",
    "我的笔记是分享平价好用的国货彩妆测评，想要一个能让人忍不住点进来的标题",
    "我整理了一份大学生兼职避坑指南，包含10种靠谱的赚钱方式，需要一个高点击率的标题"
  ],
  "103": [
    "我写了一篇关于日本京都旅游攻略的笔记，内容包括小众景点、美食推荐和省钱技巧，帮我设计吸引人的标题",
    "我的笔记是分享平价好用的国货彩妆测评，想要一个能让人忍不住点进来的标题",
    "我整理了一份大学生兼职避坑指南，包含10种靠谱的赚钱方式，需要一个高点击率的标题"
  ],
  // 默认示例（其他模板使用）
  "default": [
    "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。",
    "我是一名美食爱好者，需要一些能够让人垂涎三尺的食谱介绍文案。",
    "我是一位旅行达人，想要创作一些能够激发人们旅行欲望的目的地介绍文案。"
  ]
};

// 获取当前模板的示例提问
const getExamplePrompts = (templateId: string): string[] => {
  return examplePromptsByTemplate[templateId] || examplePromptsByTemplate["default"];
};

// 旧的示例提问（保留用于兼容）
const examplePrompts = [
  {
    id: 1,
    text: "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。",
  },
  {
    id: 2,
    text: "我是一名美食爱好者，需要一些能够让人垂涎三尺的食谱介绍文案。",
  },
  {
    id: 3,
    text: "我是一位旅行达人，想要创作一些能够激发人们旅行欲望的目的地介绍文案。",
  },
];

// 小红书旅游攻略专用示例
const travelExamplePrompts = [
  {
    id: 1,
    text: "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。",
  },
  {
    id: 2,
    text: "我是一名美食爱好者，需要一些能够让人垂涎三尺的食谱介绍文案。",
  },
  {
    id: 3,
    text: "我是一位旅行达人，想要创作一些能够激发人们旅行欲望的目的地介绍文案。",
  },
];

// 历史记录类型已从 @/lib/history-storage 导入

function getIconComponent(iconType: string) {
  switch (iconType) {
    case "xiaohongshu":
      return <Image src="/20240723180934ae8ed2830.png" alt="小红书" width={20} height={20} className="object-contain" />;
    case "report":
      return <FileCheck className="h-5 w-5 text-white" />;
    case "wechat":
      return <MessageCircle className="h-5 w-5 text-white" />;
    case "video":
      return <Video className="h-5 w-5 text-white" />;
    case "toutiao":
      return <Newspaper className="h-5 w-5 text-white" />;
    case "title":
      return <PenTool className="h-5 w-5 text-white" />;
    case "business":
      return <Briefcase className="h-5 w-5 text-white" />;
    case "weekly":
      return <Calendar className="h-5 w-5 text-white" />;
    case "hook":
      return <Target className="h-5 w-5 text-white" />;
    case "weibo":
      return <MessageSquare className="h-5 w-5 text-white" />;
    case "zhihu":
      return <BookOpen className="h-5 w-5 text-white" />;
    case "private":
      return <Share2 className="h-5 w-5 text-white" />;
    default:
      return <FileText className="h-5 w-5 text-white" />;
  }
}

export function XiaohongshuWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "小红书爆款文案";
  const templateId = searchParams.get("template") || "1";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  const [activeFilter, setActiveFilter] = useState("hot");
  const [activeTemplate, setActiveTemplate] = useState(parseInt(templateId));
  const [contentInput, setContentInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [searchQuery, setSearchQuery] = useState("");

  // 新增状态
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0); // 当前示例索引

  // 旅游攻略专用表单状态
  const [travelDestination, setTravelDestination] = useState("");
  const [travelBudget, setTravelBudget] = useState("");
  const [travelCompanion, setTravelCompanion] = useState("");
  const [travelDays, setTravelDays] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  // 账号简介专用表单状态
  const [profileCareer, setProfileCareer] = useState(""); // 职业/身份
  const [profileContent, setProfileContent] = useState(""); // 内容方向
  const [profileSkills, setProfileSkills] = useState(""); // 特殊技能/经历
  const [profileAudience, setProfileAudience] = useState(""); // 目标粉丝
  const [profilePersona, setProfilePersona] = useState(""); // 理想人设

  // SEO关键词布局专用表单状态
  const [seoContentType, setSeoContentType] = useState(""); // 内容类型
  const [seoFansCount, setSeoFansCount] = useState(""); // 粉丝数
  const [seoInteractionRate, setSeoInteractionRate] = useState(""); // 平均互动量
  const [seoOperationTime, setSeoOperationTime] = useState(""); // 运营时长
  const [seoPostFrequency, setSeoPostFrequency] = useState(""); // 发布频率
  const [seoPainPoints, setSeoPainPoints] = useState<string[]>([]); // 核心痛点(多选)
  const [seoGoal, setSeoGoal] = useState(""); // 优化目标

  // 小红书风格排版专用表单状态
  const [styleTheme, setStyleTheme] = useState(""); // 主题/核心卖点
  const [styleAudience, setStyleAudience] = useState(""); // 目标受众
  const [styleType, setStyleType] = useState(""); // 期望风格
  const [styleDraft, setStyleDraft] = useState(""); // 草稿内容（可选）

  // 产品种草笔记专用表单状态
  const [productName, setProductName] = useState(""); // 产品名称
  const [productCategory, setProductCategory] = useState(""); // 产品品类
  const [productBrand, setProductBrand] = useState(""); // 品牌
  const [productPrice, setProductPrice] = useState(""); // 价格区间
  const [productFeatures, setProductFeatures] = useState(""); // 核心卖点
  const [productAudience, setProductAudience] = useState(""); // 目标人群
  const [productScene, setProductScene] = useState(""); // 使用场景
  const [productRequirements, setProductRequirements] = useState(""); // 特殊要求（可选）

  // 根据source参数动态获取模板列表
  const getTemplatesFromSource = () => {
    if (source === "hot") {
      // 热门写作的模板（来自首页）
      return sideTemplates;
    } else if (source.startsWith("media-")) {
      const platform = source.replace("media-", "");
      // 根据平台返回对应的模板
      switch (platform) {
        case "xiaohongshu":
          return xiaohongshuTemplates.map(t => ({
            id: t.id,
            icon: "xiaohongshu",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "wechat":
          return wechatTemplates.map(t => ({
            id: t.id,
            icon: "wechat",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "toutiao":
          return toutiaoTemplates.map(t => ({
            id: t.id,
            icon: "toutiao",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "weibo":
          return weiboTemplates.map(t => ({
            id: t.id,
            icon: "weibo",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "zhihu":
          return zhihuTemplates.map(t => ({
            id: t.id,
            icon: "zhihu",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "private":
          return privateTemplates.map(t => ({
            id: t.id,
            icon: "private",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        default:
          return sideTemplates;
      }
    } else {
      // 默认返回热门写作模板
      return sideTemplates;
    }
  };

  // 动态模板列表
  const displayTemplates = getTemplatesFromSource();

  // 根据 URL 参数更新活动模板
  useEffect(() => {
    if (templateId) {
      setActiveTemplate(parseInt(templateId));
    }
  }, [templateId]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await historyStorage.getHistory(templateId);
        setHistory(historyData);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    };

    loadHistory();
  }, [templateId]);

  const handleExampleClick = (text: string) => {
    setContentInput(text);
  };

  // 智能创作
  const handleSubmit = async () => {
    // 根据模板ID验证不同的输入
    if (templateId === "101") {
      // 旅游攻略表单验证
      if (!travelDestination.trim()) {
        setError("请输入目的地");
        return;
      }
      if (!travelBudget.trim()) {
        setError("请输入预算");
        return;
      }
      if (!travelCompanion) {
        setError("请选择同行人");
        return;
      }
      if (!travelDays.trim()) {
        setError("请输入旅行天数");
        return;
      }
      if (!travelStyle) {
        setError("请选择风格偏好");
        return;
      }
    } else if (templateId === "104") {
      // 账号简介表单验证
      if (!profileCareer.trim()) {
        setError("请输入职业/身份");
        return;
      }
      if (!profileContent.trim()) {
        setError("请输入内容方向");
        return;
      }
      if (!profileAudience) {
        setError("请选择目标粉丝");
        return;
      }
      if (!profilePersona) {
        setError("请选择理想人设");
        return;
      }
    } else if (templateId === "105") {
      // SEO关键词布局表单验证
      if (!seoContentType.trim()) {
        setError("请输入内容类型");
        return;
      }
      if (!seoFansCount.trim()) {
        setError("请输入粉丝数");
        return;
      }
      if (!seoInteractionRate.trim()) {
        setError("请输入平均互动量");
        return;
      }
      if (!seoOperationTime.trim()) {
        setError("请输入运营时长");
        return;
      }
      if (!seoPostFrequency.trim()) {
        setError("请输入发布频率");
        return;
      }
      if (seoPainPoints.length === 0) {
        setError("请至少选择一个核心痛点");
        return;
      }
      if (!seoGoal.trim()) {
        setError("请输入优化目标");
        return;
      }
    } else if (templateId === "106") {
      // 小红书风格排版表单验证
      if (!styleTheme.trim()) {
        setError("请输入主题/核心卖点");
        return;
      }
      if (!styleAudience.trim()) {
        setError("请输入目标受众");
        return;
      }
      if (!styleType) {
        setError("请选择期望风格");
        return;
      }
    } else if (templateId === "107") {
      // 产品种草笔记表单验证（所有字段都是可选的，用户根据需求填选）
      // 不进行必填验证，但至少需要有一些基本信息
      if (!productName.trim() && !productCategory.trim() && !productFeatures.trim()) {
        setError("请至少填写产品名称、品类或核心卖点中的一项");
        return;
      }
    } else {
      // 其他模板的验证
      if (!contentInput.trim()) {
        setError("请输入文案主题或内容描述");
        return;
      }
    }

    setIsLoading(true);
    setError("");
    setCurrentResult("");
    setResultTab("current");

    try {
      // 根据模板ID选择API端点
      let apiEndpoint = "/api/xiaohongshu"; // 默认小红书API
      let requestBody: any = {};

      if (templateId === "101") {
        // 旅游攻略专用API
        apiEndpoint = "/api/travel-guide";
        // 将表单数据组合成结构化的描述
        const travelInfo = `📍 目的地 & 预算：${travelDestination}，预算${travelBudget}
👥 人物 & 天数：${travelCompanion === "couple" ? "情侣" : travelCompanion === "friends" ? "闺蜜" : travelCompanion === "family" ? "亲子" : travelCompanion === "solo" ? "独狼" : "其他"}，玩${travelDays}天
🎨 风格偏好：${travelStyle === "budget" ? "极致省钱干货" : "氛围感大片文案"}
${contentInput ? `\n补充说明：${contentInput}` : ""}`;
        requestBody = { content: travelInfo };
      } else if (templateId === "104") {
        // 账号简介专用API
        apiEndpoint = "/api/xiaohongshu-profile";
        // 将表单数据组合成结构化的描述
        const audienceMap: Record<string, string> = {
          student: "学生党",
          workplace: "职场人",
          mom: "宝妈",
          young: "年轻女性",
          male: "男性群体",
          other: "其他"
        };
        const personaMap: Record<string, string> = {
          professional: "专业靠谱",
          fun: "有趣好玩",
          warm: "温暖治愈",
          cool: "酷飒个性",
          literary: "文艺清新"
        };
        const profileInfo = `👤 职业/身份：${profileCareer}
📝 内容方向：${profileContent}
${profileSkills ? `💡 特殊技能/经历：${profileSkills}\n` : ""}🎯 目标粉丝：${audienceMap[profileAudience] || profileAudience}
✨ 理想人设：${personaMap[profilePersona] || profilePersona}
${contentInput ? `\n补充说明：${contentInput}` : ""}`;
        requestBody = { content: profileInfo };
      } else if (templateId === "105") {
        // SEO关键词布局专用API
        apiEndpoint = "/api/xiaohongshu-seo";
        // 将表单数据组合成结构化的描述
        const painPointsText = seoPainPoints.map(point => {
          const painPointMap: Record<string, string> = {
            "low-exposure": "笔记曝光量低,自然流量少",
            "low-search": "搜索来源占比不到10%",
            "no-ranking": "某些关键词想做但一直排不上去",
            "no-keywords": "不知道该布局哪些关键词",
            "no-optimization": "写好的笔记不知道如何优化"
          };
          return painPointMap[point] || point;
        }).join("、");

        const seoInfo = `1️⃣ 账号基本信息：
- 内容类型：${seoContentType}
- 粉丝数：${seoFansCount}
- 平均互动量：${seoInteractionRate}
- 运营时长：${seoOperationTime}
- 发布频率：${seoPostFrequency}

2️⃣ 当前核心痛点：
${painPointsText}

3️⃣ 优化目标：
${seoGoal}
${contentInput ? `\n补充说明（代表性笔记链接或其他信息）：\n${contentInput}` : ""}`;
        requestBody = { content: seoInfo };
      } else if (templateId === "106") {
        // 小红书风格排版专用API
        apiEndpoint = "/api/xiaohongshu-style";
        // 将表单数据组合成结构化的描述
        const styleTypeMap: Record<string, string> = {
          "girlfriend": "闺蜜夜话风",
          "boss": "清醒大女主风",
          "geek": "硬核极客风",
          "crazy": "发疯文学风"
        };
        const styleInfo = `📝 主题/核心卖点：${styleTheme}
🎯 目标受众：${styleAudience}
🎨 期望风格：${styleTypeMap[styleType] || styleType}
${styleDraft ? `\n草稿内容：\n${styleDraft}\n` : ""}${contentInput ? `\n补充说明：${contentInput}` : ""}`;
        requestBody = { content: styleInfo };
      } else if (templateId === "107") {
        // 产品种草笔记专用API
        apiEndpoint = "/api/product-review";
        // 将表单数据组合成结构化的描述
        const productInfo = `📦 产品信息：${productName ? `${productName}` : ""}${productCategory ? ` | 品类：${productCategory}` : ""}${productBrand ? ` | 品牌：${productBrand}` : ""}${productPrice ? ` | 价格：${productPrice}` : ""}

⭐ 核心卖点：${productFeatures || "待补充"}

👥 目标人群：${productAudience || "待补充"}

🎯 使用场景：${productScene || "待补充"}
${productRequirements ? `\n💡 特殊要求：${productRequirements}` : ""}`;
        requestBody = { content: productInfo };
      } else if (templateId === "6" || templateId === "103") {
        // 小红书爆款标题专用API
        apiEndpoint = "/api/xiaohongshu-title";
        requestBody = { content: contentInput };
      } else if (templateId === "3") {
        // 公众号文章撰写
        apiEndpoint = "/api/wechat-article";
        requestBody = { content: contentInput };
      } else if (templateId === "4" || templateId === "9") {
        // 短视频相关模板，注意：实际应该跳转到视频页面，这里作为兜底
        apiEndpoint = "/api/video";
        requestBody = { content: contentInput };
      } else {
        requestBody = { content: contentInput };
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // 先读取响应文本，然后尝试解析为JSON
      const responseText = await response.text();

      // 检查响应状态
      if (!response.ok) {
        let errorMessage = "请求失败";
        try {
          const data = JSON.parse(responseText);
          errorMessage = data.error || `请求失败 (${response.status})`;
        } catch (jsonError) {
          // 如果不是JSON格式，直接使用文本内容
          errorMessage = responseText || `请求失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // 解析成功的响应
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error("服务器返回了无效的响应格式");
      }

      if (!data.result) {
        throw new Error("AI返回结果为空，请重试");
      }

      setCurrentResult(data.result);

      // 添加到历史记录
      try {
        const contentForHistory = templateId === "101"
          ? `${travelDestination} | ${travelCompanion} | ${travelDays}天 | ${travelStyle}`
          : templateId === "104"
          ? `${profileCareer} | ${profileContent} | ${profileAudience}`
          : templateId === "105"
          ? `${seoContentType} | ${seoFansCount}粉丝 | ${seoPainPoints.length}个痛点`
          : templateId === "106"
          ? `${styleTheme} | ${styleAudience} | ${styleType}`
          : templateId === "107"
          ? `${productName || productCategory} | ${productAudience || "通用"} | ${productScene || "日常使用"}`
          : contentInput;

        const newHistoryItem = await historyStorage.addHistory(
          templateId,
          templateTitle,
          contentForHistory,
          data.result
        );
        setHistory((prev) => [newHistoryItem, ...prev]);
      } catch (historyError) {
        console.error('保存历史记录失败:', historyError);
        // 历史记录保存失败不影响主流程
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "创作失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 复制结果
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 删除历史记录
  const handleDeleteHistory = async (id: number) => {
    try {
      await historyStorage.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('删除历史记录失败:', error);
    }
  };

  // 加载历史记录到编辑器
  const handleLoadHistory = (item: HistoryItem) => {
    setCurrentResult(item.result);
    setResultTab("current");
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 根据source参数判断返回路径
  const getBackPath = () => {
    if (source === "hot") {
      // 从热门写作来的，返回首页
      return "/";
    } else if (source.startsWith("media-")) {
      // 从自媒体分类来的，返回自媒体分类页
      return "/?category=media";
    } else {
      // 默认返回首页
      return "/";
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Center - Form Area */}
      <div className="w-[60%] flex flex-col overflow-hidden">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => router.push(getBackPath())}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回</span>
          </button>

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              {templateTitle}
            </h1>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => {
                const examples = getExamplePrompts(templateId);
                const nextIndex = (currentExampleIndex + 1) % examples.length;
                handleExampleClick(examples[currentExampleIndex]);
                setCurrentExampleIndex(nextIndex);
              }}
            >
              插入示例 {currentExampleIndex + 1}/{getExamplePrompts(templateId).length}
            </Button>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              {templateId === "101"
                ? "✨ 嘿！欢迎来到小红书旅游攻略创作空间！我不仅是一名旅游爱好者，更是一位精通小红书流量密码的内容架构师。准备好了吗？让我们一起打造下一篇万赞笔记吧！🌟"
                : templateId === "104"
                ? "🎯 嗨，我是你的小红书简介优化大师！专注小红书个人IP打造，精通用户心理与平台算法。我会帮你用最简洁、最有感染力的语言，让陌生人3秒内记住你、相信你、关注你！准备好打造你的专属人设了吗？✨"
                : templateId === "105"
                ? "🎯 你好！我是你的小红书SEO关键词布局专家，专注于帮助创作者通过科学的SEO策略，让优质内容获得它应得的流量和关注。我精通小红书搜索算法，擅长关键词挖掘和内容优化。准备好用SEO打开流量闸门了吗？🚀"
                : templateId === "106"
                ? "🚀 哈喽！我是你的小红书爆款内容操盘手！别让你的好内容被埋没！不管是干货种草🌱、情绪宣泄💢还是硬核科普🧠，我都能帮你把流量拿捏得死死的。我精通流量算法、视觉排版美学、爆款文案心理学和SEO关键词布局。准备好打造爆款笔记了吗？✨"
                : templateId === "107"
                ? "🌟 嗨呀！我是你的小红书爆款文案搭子！把产品变成让人忍不住点赞收藏的种草笔记！无论是美妆护肤、数码家电还是生活好物，我都能写出让人心动下单的文案～准备好一起整个爆款出来了吗？🚀"
                : templateId === "6" || templateId === "103"
                ? "👋 你好呀！我是你的小红书爆款标题大师，拥有50年的标题创作经验，帮助过无数创作者打造出10w+阅读的爆款笔记！请告诉我你的笔记内容主题、目标人群和账号定位，让我为你创作3-5个不同风格的标题方案！🚀"
                : templateId === "1" || templateId === "102"
                ? "👋 你好呀！我是你的小红书爆款文案大师，拥有50年内容创作经验，已经帮助无数创作者打造出10w+点赞的爆款笔记。我精通小红书平台的流量密码，深谙用户心理，能够为你量身定制高互动、高转化的优质文案！✨"
                : `欢迎来到${templateTitle}创作空间！让我们一起探索如何创作出能够吸引用户注意力的内容。请告诉我你想要聚焦的主题或领域，让我们开始创作吧！`
              }
            </p>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            {/* 旅游攻略专用表单 */}
            {templateId === "101" ? (
              <>
                {/* 目的地 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📍 目的地
                  </label>
                  <Input
                    placeholder="例如：成都、大理、三亚..."
                    value={travelDestination}
                    onChange={(e) => setTravelDestination(e.target.value)}
                  />
                </div>

                {/* 预算 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    💰 预算
                  </label>
                  <Input
                    placeholder="例如：3000元、5000-8000元、穷游..."
                    value={travelBudget}
                    onChange={(e) => setTravelBudget(e.target.value)}
                  />
                </div>

                {/* 同行人 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    👥 同行人
                  </label>
                  <Select value={travelCompanion} onValueChange={setTravelCompanion}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择同行人" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="couple">情侣</SelectItem>
                      <SelectItem value="friends">闺蜜</SelectItem>
                      <SelectItem value="family">亲子</SelectItem>
                      <SelectItem value="solo">独狼</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 旅行天数 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📅 旅行天数
                  </label>
                  <Input
                    type="number"
                    placeholder="例如：3、5、7..."
                    value={travelDays}
                    onChange={(e) => setTravelDays(e.target.value)}
                    min="1"
                  />
                </div>

                {/* 风格偏好 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎨 风格偏好
                  </label>
                  <Select value={travelStyle} onValueChange={setTravelStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择风格偏好" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">极致省钱干货</SelectItem>
                      <SelectItem value="aesthetic">氛围感大片文案</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 额外描述（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    补充说明（可选）
                  </label>
                  <Textarea
                    placeholder="您可以补充更多信息，比如特殊需求、想去的景点、饮食偏好等..."
                    className="min-h-[100px] resize-none"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>
              </>
            ) : templateId === "104" ? (
              <>
                {/* 账号简介专用表单 */}
                {/* 职业/身份 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    👤 职业/身份
                  </label>
                  <Input
                    placeholder="例如：全职妈妈、UI设计师、在校大学生..."
                    value={profileCareer}
                    onChange={(e) => setProfileCareer(e.target.value)}
                  />
                </div>

                {/* 内容方向 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📝 内容方向
                  </label>
                  <Input
                    placeholder="例如：穿搭、美食、学习、职场、探店..."
                    value={profileContent}
                    onChange={(e) => setProfileContent(e.target.value)}
                  />
                </div>

                {/* 特殊技能/经历 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    💡 特殊技能/经历（可选）
                  </label>
                  <Textarea
                    placeholder="有什么让你与众不同的地方？例如：5年摄影经验、去过30个国家、自学转行成功..."
                    className="min-h-[80px] resize-none"
                    value={profileSkills}
                    onChange={(e) => setProfileSkills(e.target.value)}
                  />
                </div>

                {/* 目标粉丝 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎯 目标粉丝
                  </label>
                  <Select value={profileAudience} onValueChange={setProfileAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择目标粉丝群体" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">学生党</SelectItem>
                      <SelectItem value="workplace">职场人</SelectItem>
                      <SelectItem value="mom">宝妈</SelectItem>
                      <SelectItem value="young">年轻女性</SelectItem>
                      <SelectItem value="male">男性群体</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 理想人设 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    ✨ 理想人设
                  </label>
                  <Select value={profilePersona} onValueChange={setProfilePersona}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择理想人设风格" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">专业靠谱</SelectItem>
                      <SelectItem value="fun">有趣好玩</SelectItem>
                      <SelectItem value="warm">温暖治愈</SelectItem>
                      <SelectItem value="cool">酷飒个性</SelectItem>
                      <SelectItem value="literary">文艺清新</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 补充说明（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    补充说明（可选）
                  </label>
                  <Textarea
                    placeholder="还有其他想补充的信息吗？比如你的成就、特色、想强调的点..."
                    className="min-h-[80px] resize-none"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>
              </>
            ) : templateId === "105" ? (
              <>
                {/* SEO关键词布局专用表单 */}
                {/* 内容类型 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📝 内容类型
                  </label>
                  <Input
                    placeholder="例如：美妆测评、职场干货、旅行攻略、穿搭分享..."
                    value={seoContentType}
                    onChange={(e) => setSeoContentType(e.target.value)}
                  />
                </div>

                {/* 粉丝数 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    👥 粉丝数
                  </label>
                  <Input
                    placeholder="例如：500、2000、1万、5万..."
                    value={seoFansCount}
                    onChange={(e) => setSeoFansCount(e.target.value)}
                  />
                </div>

                {/* 平均互动量 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    💬 平均互动量
                  </label>
                  <Input
                    placeholder="例如：50赞10收藏、100-200互动、5%互动率..."
                    value={seoInteractionRate}
                    onChange={(e) => setSeoInteractionRate(e.target.value)}
                  />
                </div>

                {/* 运营时长 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    ⏰ 运营时长
                  </label>
                  <Input
                    placeholder="例如：3个月、半年、1年、2年..."
                    value={seoOperationTime}
                    onChange={(e) => setSeoOperationTime(e.target.value)}
                  />
                </div>

                {/* 发布频率 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📅 发布频率
                  </label>
                  <Input
                    placeholder="例如：每周3篇、每天1篇、不定期..."
                    value={seoPostFrequency}
                    onChange={(e) => setSeoPostFrequency(e.target.value)}
                  />
                </div>

                {/* 核心痛点（多选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎯 当前核心痛点（可多选）
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: "low-exposure", label: "笔记曝光量低,自然流量少" },
                      { value: "low-search", label: "搜索来源占比不到10%" },
                      { value: "no-ranking", label: "某些关键词想做但一直排不上去" },
                      { value: "no-keywords", label: "不知道该布局哪些关键词" },
                      { value: "no-optimization", label: "写好的笔记不知道如何优化" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={seoPainPoints.includes(option.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSeoPainPoints([...seoPainPoints, option.value]);
                            } else {
                              setSeoPainPoints(seoPainPoints.filter(p => p !== option.value));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 优化目标 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎯 优化目标
                  </label>
                  <Textarea
                    placeholder="例如：月涨粉1000、核心词排进前5、搜索流量占比提升到30%..."
                    className="min-h-[80px] resize-none"
                    value={seoGoal}
                    onChange={(e) => setSeoGoal(e.target.value)}
                  />
                </div>

                {/* 补充说明（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    📎 补充说明（可选）
                  </label>
                  <Textarea
                    placeholder="可以提供2-3篇代表性笔记链接，或其他想补充的信息..."
                    className="min-h-[100px] resize-none"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>
              </>
            ) : templateId === "106" ? (
              <>
                {/* 小红书风格排版专用表单 */}
                {/* 主题/核心卖点 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📝 主题/核心卖点
                  </label>
                  <Input
                    placeholder="例如：AI效率工具、秋季穿搭、护肤routine..."
                    value={styleTheme}
                    onChange={(e) => setStyleTheme(e.target.value)}
                  />
                </div>

                {/* 目标受众 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎯 目标受众
                  </label>
                  <Input
                    placeholder="例如：25-35岁都市女性、设计师群体、大学生..."
                    value={styleAudience}
                    onChange={(e) => setStyleAudience(e.target.value)}
                  />
                </div>

                {/* 期望风格 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎨 期望风格
                  </label>
                  <Select value={styleType} onValueChange={setStyleType}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择期望风格" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="girlfriend">闺蜜夜话风（软萌亲切，适合美妆/情感）</SelectItem>
                      <SelectItem value="boss">清醒大女主风（犀利金句，适合职场/成长）</SelectItem>
                      <SelectItem value="geek">硬核极客风（参数对比，适合数码/家电）</SelectItem>
                      <SelectItem value="crazy">发疯文学风（情绪夸张，适合吐槽/搞笑）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 草稿内容（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    📄 草稿内容（可选）
                  </label>
                  <Textarea
                    placeholder="如果你已经有初稿，可以粘贴在这里，我来帮你优化排版和风格..."
                    className="min-h-[120px] resize-none"
                    value={styleDraft}
                    onChange={(e) => setStyleDraft(e.target.value)}
                  />
                </div>

                {/* 补充说明（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    💡 补充说明（可选）
                  </label>
                  <Textarea
                    placeholder="还有其他想补充的信息吗？比如特殊要求、参考案例等..."
                    className="min-h-[80px] resize-none"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>
              </>
            ) : templateId === "107" ? (
              <>
                {/* 产品种草笔记专用表单 */}
                {/* 产品名称 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    📦 产品名称
                  </label>
                  <Input
                    placeholder="例如：戴森吹风机、雅诗兰黛小棕瓶、iPhone 15 Pro..."
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                {/* 产品品类 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    🏷️ 产品品类
                  </label>
                  <Input
                    placeholder="例如：美妆护肤、数码家电、生活好物、食品饮料..."
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  />
                </div>

                {/* 品牌 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    🎨 品牌
                  </label>
                  <Input
                    placeholder="例如：戴森、雅诗兰黛、苹果、无印良品..."
                    value={productBrand}
                    onChange={(e) => setProductBrand(e.target.value)}
                  />
                </div>

                {/* 价格区间 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    💰 价格区间
                  </label>
                  <Input
                    placeholder="例如：99元、300-500元、千元以内..."
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                  />
                </div>

                {/* 核心卖点 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    ⭐ 核心卖点
                  </label>
                  <Textarea
                    placeholder="请列出产品最牛的3个优势，例如：&#10;1. 超强吸力，3分钟吹干长发&#10;2. 智能温控，不伤发质&#10;3. 静音设计，深夜也能用"
                    className="min-h-[100px] resize-none"
                    value={productFeatures}
                    onChange={(e) => setProductFeatures(e.target.value)}
                  />
                </div>

                {/* 目标人群 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    👥 目标人群
                  </label>
                  <Input
                    placeholder="例如：学生党、上班族、宝妈、精致女孩..."
                    value={productAudience}
                    onChange={(e) => setProductAudience(e.target.value)}
                  />
                </div>

                {/* 使用场景 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    🎯 使用场景
                  </label>
                  <Textarea
                    placeholder="什么时候用？解决什么问题？例如：&#10;- 早晨赶时间，快速造型&#10;- 约会前，打造精致发型&#10;- 健身后，快速吹干头发"
                    className="min-h-[100px] resize-none"
                    value={productScene}
                    onChange={(e) => setProductScene(e.target.value)}
                  />
                </div>

                {/* 特殊要求（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    💡 特殊要求（可选）
                  </label>
                  <Textarea
                    placeholder="有没有特别想强调的点？喜欢什么风格？例如：&#10;- 强调性价比&#10;- 突出颜值设计&#10;- 偏好真实体验感..."
                    className="min-h-[100px] resize-none"
                    value={productRequirements}
                    onChange={(e) => setProductRequirements(e.target.value)}
                  />
                </div>

                {/* 继续提问提示 */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    💬 <strong>提示：</strong>生成文案后，你可以在下方继续提问，比如：
                    <br />• "能不能再强调一下性价比？"
                    <br />• "标题能不能更吸引人一点？"
                    <br />• "能不能换个风格，更活泼一些？"
                  </p>
                </div>
              </>
            ) : (
              /* 其他模板的通用表单 */
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  描述内容
                </label>
                <Textarea
                  placeholder="请输入您想要创作的文案主题或内容描述..."
                  className="min-h-[160px] resize-none"
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Model Selection */}
            <div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">
                    厉害猫AI-极速模型 (消耗0.2算力/1000字符)
                  </SelectItem>
                  <SelectItem value="standard">
                    厉害猫AI-标准模型 (消耗0.5算力/1000字符)
                  </SelectItem>
                  <SelectItem value="advanced">
                    厉害猫AI-高级模型 (消耗1.0算力/1000字符)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-11 text-base"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI创作中...
                </>
              ) : (
                "智能创作"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Results Area */}
      <div className="w-[40%] border-l border-border bg-card flex flex-col relative">
        {/* Result Tabs */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={resultTab === "current" ? "default" : "outline"}
              size="sm"
              onClick={() => setResultTab("current")}
              className="h-8"
            >
              本次创作结果
            </Button>
            <Button
              variant={resultTab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setResultTab("history")}
              className="h-8"
            >
              历史创作结果
            </Button>
          </div>
        </div>

        {/* Result Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {resultTab === "current" ? (
            // 本次创作结果
            isLoading ? (
              // 加载状态
              <div className="flex flex-col items-center justify-center h-full p-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  AI正在为您创作爆款文案...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  预计需要10-20秒
                </p>
              </div>
            ) : currentResult ? (
              // 显示富文本编辑器结果
              <div className="flex-1 flex flex-col overflow-hidden">
                <RichTextEditor
                  initialContent={currentResult}
                  className="flex-1"
                />
                {/* 底部操作按钮 */}
                <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        // 分享功能
                        if (navigator.share) {
                          navigator.share({
                            title: "小红书爆款文案",
                            text: currentResult,
                          });
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      重写
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => handleCopy(currentResult)}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setCurrentResult("");
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        // 保存到历史记录
                        alert("已保存");
                      }}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // 空状态
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  AI创作结果会在显示这里，现在你只需要
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    1. 在左侧填好必要的信息，填写越详细，结果越准确哦
                  </p>
                  <p>
                    2. 点击智能创作按钮，静待AI妙笔生花，一般在10秒内搞定
                  </p>
                </div>
              </div>
            )
          ) : (
            // 历史创作结果
            <ScrollArea className="h-full">
              {history.length > 0 ? (
                <div className="p-4 space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.timestamp)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadHistory(item);
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            加载
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item.result);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(item.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground font-medium mb-1 line-clamp-1">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.result.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    暂无历史创作记录
                  </p>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Customer Service Button */}
        <div className="absolute bottom-20 right-4">
          <Button variant="outline" size="sm" className="rounded-full px-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            客服
          </Button>
        </div>
      </div>
    </div>
  );
}
