"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  MessageCircle,
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
  Plus,
  Send,
} from "lucide-react";
import { MessageBubble } from "@/components/message-bubble";
import { supabase } from "@/lib/supabase";
import { cleanMarkdownClient } from "@/lib/markdown-cleaner-client";
import {
  createConversation,
  getConversations,
  addMessage,
  type Conversation as DBConversation,
  type ConversationType,
} from "@/lib/conversations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import {
  xiaohongshuTemplates,
  wechatTemplates,
  toutiaoTemplates,
  weiboTemplates,
  zhihuTemplates,
  privateTemplates,
} from "@/components/media-page"; // 从media-page导入模板数据
import { getTemplateById, getCanonicalId, isLegacyId } from "@/lib/template-config";
import { brandStrategyTemplates } from "@/lib/marketing-templates";
import { useCredits } from "@/lib/credits-context";

// 顶部筛选标签
const topFilters = [
  { id: "hot", label: "热门写作" },
  { id: "newest", label: "最新推出" },
  { id: "featured", label: "平台精选" },
];

// 左侧写作模板列表（使用统一的规范ID）
const sideTemplates = [
  {
    id: 102, // 统一为规范ID（原ID: 1）
    icon: "report",
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
    id: 201, // 统一为规范ID（原ID: 3）
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
    id: 103, // 统一为规范ID（原ID: 6）
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
  // 小红书爆款文案 (templateId = "102")
  "102": [
    "我是一名时尚博主，想要创作一篇关于秋季穿搭的小红书笔记，目标受众是25-35岁的都市女性",
    "我开了一家咖啡店，想要在小红书上分享我们的特色拿铁和店铺氛围，吸引年轻人打卡",
    "我是护肤达人，想要分享一套适合干皮的冬季护肤routine，需要专业又接地气的文案"
  ],
  // 小红书爆款标题 (templateId = "103")
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

// 小红书8个子类型的AI欢迎消息
// 101: 旅游攻略
const XIAOHONGSHU_TRAVEL_WELCOME = `你好呀！我是你的小红书爆款旅游攻略架构师，不仅是一名旅游爱好者，更是一位精通小红书流量密码的内容架构师。我擅长将平淡的旅行经历转化为具有高情绪价值、强视觉冲击力和高收藏率的种草笔记。

准备好了吗？让我们一起打造下一篇万赞笔记吧！

请告诉我：
1. 目的地 & 预算：想去哪？大概预算多少？
2. 人物 & 天数：和谁去？玩几天？（情侣/闺蜜/亲子/独狼）
3. 风格偏好：想要【极致省钱干货】还是【氛围感大片文案】？`;

// 102: 爆款文案
const XIAOHONGSHU_COPYWRITING_WELCOME = `你好呀！我是你的小红书爆款文案大师，拥有50年内容创作经验，已经帮助无数创作者打造出10w+点赞的爆款笔记。我擅长洞悉用户心理，深谙流量密码，高转化的优质文案！

请告诉我：
1. 你想创作什么主题的小红书笔记？
2. 你的目标受众是谁？
3. 你希望达到什么效果？

我会为你量身定制爆款文案！`;

// 103: 爆款标题
const XIAOHONGSHU_TITLE_WELCOME = `你好呀！我是你的小红书爆款标题大师，拥有50年的标题创作经验，帮助过无数创作者打造出10w+阅读的爆款笔记！

我能帮你做什么：
- 创作吸睛的爆款标题，提升点击率和曝光量
- 分析标题背后的流量密码和心理学原理
- 针对不同赛道提供定制化标题策略
- 优化现有标题，避开限流风险
- 教你建立标题创作思维体系

我的工作流程：
1. 先了解你的内容主题、目标人群和账号定位
2. 为你创作3-5个不同风格的标题方案
3. 详细讲解每个标题的创作技巧和预期效果
4. 根据你的反馈持续优化，直到满意为止
5. 附赠内容创作和运营建议，让标题与内容完美配合

现在，请告诉我你想创作什么类型的内容？或者有什么标题需求？让我们一起打造爆款吧！`;

// 104: 账号简介
const XIAOHONGSHU_PROFILE_WELCOME = `你好呀！我是你的小红书简介优化大师，专注小红书个人IP打造的文案策划专家。我精通用户心理与平台算法，擅长将复杂的个人背景浓缩成一句话记忆点，让你的账号简介成为涨粉利器！

在小红书这个内容竞争激烈的平台上，账号简介是用户决定是否关注你的关键3秒。数据显示，一个优质的简介能让关注转化率提升40%以上。

我会为你提供3-5条不同风格的简介方案（亲和型/专业型/个性型/故事型），确保每条文案都符合"3秒看懂、5秒记住、想点关注"的标准。

请告诉我：
1. 职业/身份：你是做什么的？
2. 内容方向：你主要分享什么内容？
3. 特殊技能/经历：有什么特别的经历或技能吗？（可选）
4. 目标粉丝：你想吸引什么样的粉丝？
5. 理想人设：你希望给人什么样的印象？`;

// 105: SEO关键词布局
const XIAOHONGSHU_SEO_WELCOME = `你好呀！我是你的小红书SEO关键词布局专家，专注于帮助创作者通过科学的关键词策略提升笔记曝光量和搜索排名！

我能帮你解决：
- 笔记曝光量低，自然流量少
- 搜索来源占比不到10%
- 某些关键词想做但一直排不上去
- 不知道该布局哪些关键词
- 写好的笔记不知道如何优化

请告诉我你的账号基本信息：
1. 账号基本信息：
   - 内容类型（美妆/穿搭/美食/旅行等）
   - 粉丝数
   - 平均互动量
   - 运营时长
   - 发布频率

2. 当前核心痛点：你目前遇到的主要问题是什么？

3. 优化目标：你希望达到什么效果？（例如：月涨粉1000、核心词排进前5等）`;

// 106: 风格改写
const XIAOHONGSHU_STYLE_WELCOME = `哈喽！我是你的小红书爆款内容操盘手。

别让你的好内容被埋没！不管是干货种草、情绪宣泄还是硬核科普，我都能帮你把流量拿捏得死死的。

请告诉我你想写什么？
1. 主题/核心卖点：你想写什么内容？
2. 目标受众：你的目标读者是谁？
3. 期望风格：你想要什么风格？
   - 闺蜜夜话风（软萌亲切，适合美妆/情感）
   - 清醒大女主风（犀利金句，适合职场/成长）
   - 硬核极客风（参数对比，适合数码/家电）
   - 发疯文学风（情绪夸张，适合吐槽/搞笑）
4. 草稿内容（可选）：如果你已经有初稿，可以粘贴给我，我来帮你优化排版和风格

或者直接丢给我一段草稿，我来帮你'整容'！`;

// 107: 产品种草
const XIAOHONGSHU_PRODUCT_WELCOME = `嗨呀！我是你的小红书爆款文案搭子。

我能帮你做什么？
把产品变成让人忍不住点赞收藏的种草笔记！无论是美妆护肤、数码家电还是生活好物，我都能写出让人心动下单的文案～

开始之前，请告诉我：
1. 产品名称：你要种草什么产品？
2. 产品品类：属于什么类别？（美妆护肤/数码家电/生活好物等）
3. 品牌：什么品牌？
4. 价格区间：大概什么价位？
5. 核心卖点：产品最牛的3个优势是什么？
6. 目标人群：想推荐给谁？（学生党/上班族/宝妈等）
7. 使用场景：什么时候用？解决什么问题？

提示：生成文案后，你可以继续提问进行优化哦～`;

// 108: 好物推荐
const XIAOHONGSHU_RECOMMENDATION_WELCOME = `哈喽宝子们！我是你们的小红书爆款种草专家呱呱！

不管你是想推美妆神仙水、硬核黑科技，还是家居好物，我都能帮你把草种到用户的心坎里！

快告诉我你要推什么？
1. 产品是什么？（最好带上核心卖点，越细越好！）
   - 产品名称
   - 所属赛道（美妆/数码/家居/食品等）
   - 核心卖点

2. 想推给谁看？（学生党？打工人？精致妈妈？）

3. 希望什么风格？
   - 真诚分享（像闺蜜一样唠嗑）
   - 硬核测评（专业大神测评）
   - 搞笑吐槽（幽默风趣）

提示：生成文案后，你可以继续提问进行优化哦～`;

// 保留旧的常量名以兼容现有代码
const XIAOHONGSHU_WELCOME_MESSAGE = XIAOHONGSHU_COPYWRITING_WELCOME;

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
    case "report":
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

export function BrandStrategyWritingPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "品牌战略";
  const templateId = searchParams.get("template") || "10001";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  // 品牌战略模块的类型映射函数
  const getBrandStrategyTypeByTemplateId = (templateId: string): ConversationType => {
    const mapping: Record<string, ConversationType> = {
      '10001': 'brand-strategy-company-intro',
      '10002': 'brand-strategy-positioning-slogan',
      '10003': 'brand-strategy-brand-house',
      '10004': 'brand-strategy-positioning-report',
      '10005': 'brand-strategy-vision-mission',
      '10006': 'brand-strategy-value-proposition',
      '10007': 'brand-strategy-positioning-map',
      '10008': 'brand-strategy-architecture',
      '10009': 'brand-strategy-story-narrative',
      '10010': 'brand-strategy-audience-analysis',
      '10011': 'brand-strategy-competitor-analysis',
      '10012': 'brand-strategy-differentiation',
      '10013': 'brand-strategy-extension-plan',
      '10014': 'brand-strategy-risk-management',
      '10015': 'brand-strategy-annual-plan',
    };
    return mapping[templateId] || 'brand-strategy-company-intro';
  };

  // 自动重定向旧ID到新ID
  useEffect(() => {
    const numId = parseInt(templateId);
    const canonicalId = getCanonicalId(numId);
    const template = getTemplateById(canonicalId);

    if (template && canonicalId !== numId) {
      // 如果是旧ID，重定向到规范ID
      console.warn(`Legacy ID ${numId} detected, redirecting to canonical ID ${canonicalId}`);
      const newUrl = `${template.routePath}?template=${canonicalId}&title=${encodeURIComponent(template.title)}&source=${source}`;
      router.replace(newUrl);
    }
  }, [templateId, router, source]);

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
  const [copied, setCopied] = useState(false);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0); // 当前示例索引

  // 统一的对话框状态（所有小红书子类型共用）
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isCollapsed: boolean;
  }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputHeight, setInputHeight] = useState(60);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 用户认证和历史记录状态
  const [userId, setUserId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [historyConversations, setHistoryConversations] = useState<DBConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 根据source参数动态获取模板列表
  const getTemplatesFromSource = () => {
    if (source === "hot") {
      // 热门写作的模板（来自首页）
      return sideTemplates;
    } else if (source.startsWith("media-")) {
      const platform = source.replace("media-", "");
      // 根据平台返回对应的模板
      switch (platform) {
        case "brand-strategy":
          return brandStrategyTemplates.map((t: any) => ({
            id: t.id,
            icon: "brand-strategy",
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

  // 获取当前用户
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;

      setIsLoadingHistory(true);
      try {
        // 根据当前模板ID获取对应的子类型
        const conversationType = getBrandStrategyTypeByTemplateId(activeTemplate.toString());
        const conversations = await getConversations(userId, undefined, conversationType);
        setHistoryConversations(conversations);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [userId, activeTemplate]);

  const handleExampleClick = (text: string) => {
    setContentInput(text);
  };

  // 获取当前模板对应的欢迎消息
  const getWelcomeMessage = (templateId: string): string => {
    const welcomeMessages: Record<string, string> = {
      "10001": `您好!我是您的企业简介内容策划专家,拥有50年丰富的落地项目经验。我专注于帮助企业打造具有商业价值和传播力的高质量简介内容。

我能为您提供:
- 深度挖掘企业核心价值和差异化优势
- 创作多场景应用的专业企业简介
- 构建完整的品牌叙事体系
- 提供可落地执行的优化建议

现在,请告诉我您企业的基本情况和这次内容策划的具体需求,让我们开始为您的企业打造一份出色的简介!`,
      "10002": `你好，我是拥有50年经验的品牌定位与Slogan铸造大师。在这个注意力稀缺的时代，如果不能用一句话说清你是谁，你就失去了被选择的机会。

请告诉我：
1. 你卖的是什么产品/服务？
2. 你想卖给谁？（目标人群）
3. 比起竞争对手，你最大的不同/优势是什么？

告诉我这些，我来帮你铸造一把切开市场的利剑。`,
      "10003": `你好，我是拥有50年实战经验的品牌屋梳理专家。我看过太多企业因为品牌地基不稳而轰然倒塌，也帮过无数企业通过厘清战略重获新生。

在帮你搭建那座坚固的'品牌屋'之前，我需要先给你的企业做个'体检'。请告诉我：
1. 你是做什么生意的？（行业与核心产品）
2. 你觉得目前品牌遇到的最大困惑是什么？
3. 你的目标客户是谁？他们为什么非选你不可？

请回答，我们开始干活。`,
      "10004": `您好!👋 我是您的品牌定位战略大师,拥有50年的品牌战略实战经验。

我专注于帮助企业建立清晰、独特、有竞争力的品牌定位。通过系统化的分析方法和经过验证的战略框架,我将协助您:
- 🎯 明确品牌的核心价值和差异化优势
- 👥 精准定位目标消费者
- 🏆 制定有效的竞争策略
- 📋 输出专业的品牌定位报告

现在,让我们开始这段品牌定位之旅吧!请告诉我:您的品牌/企业属于什么行业?目前面临的主要品牌挑战是什么?`,
      "10005": `👋 您好!我是一位拥有50年实战经验的品牌战略顾问,很高兴能够协助您打造具有感召力的品牌愿景与使命。

在过去的半个世纪里,我帮助过500多家企业找到了他们的战略方向和品牌灵魂——从初创公司到行业巨头,从传统制造到前沿科技。我深知,一个清晰有力的愿景与使命,不仅能凝聚团队、打动客户,更能在迷茫时指引方向,在困难时提供动力。

现在,让我们开始吧!请告诉我:
- 您的企业处于什么行业?主要提供什么产品或服务?
- 您的企业目前处于什么发展阶段?(初创期/成长期/成熟期/转型期)
- 您希望解决什么问题?是重新定义愿景使命,还是优化现有表述?

期待您的分享! 🚀`,
      "10006": `您好!我是品牌价值主张战略大师,拥有50年品牌战略实战经验,专注于帮助企业构建具有市场穿透力的价值主张体系。

我能为您做什么?
✅ 战略层: 品牌定位、差异化策略、市场切入点设计
✅ 战术层: 价值提炼、客户洞察、竞品分析
✅ 执行层: 话术体系、传播方案、落地路线图
✅ 优化层: 效果验证、迭代优化、风险规避

现在,请告诉我:
1. 您的企业所在行业与主营业务是什么?
2. 您希望解决的核心问题是什么?(如:品牌认知度低、同质化竞争、转化率不理想等)
3. 您的目标客户是谁?

让我们开始这段价值发现之旅! 🚀`,
      "10007": `你好，我是呱呱配置的品牌定位地图大师。我有50年的品牌实战经验，见证过无数品牌的崛起与陨落。我不讲空洞的理论，我只帮你画一张图——一张让你看清战场、找到胜算的'作战地图'。

请告诉我:
1. 您的行业、核心产品/服务是什么?
2. 目前最大的3个竞争对手是谁?
3. 您自己认为的优势(哪怕是模糊的)是什么?`,
      "10008": `你好，我是拥有半个世纪实战经验的顶级品牌架构策略大师。我擅长处理复杂的企业品牌组合关系，用最犀利的商业视角解决品牌混乱问题。

我能为您提供:
- 诊断核心问题: 快速识别品牌架构混乱点
- 构建最优模型: 推荐最适合的架构模式
- 制定迁移路径: 提供平稳过渡的执行方案
- 规范命名与视觉: 建立逻辑严密的命名体系

请告诉我您的企业背景及面临的最棘手的品牌难题，以便开始诊断。`,
      "10009": `您好!我是品牌故事叙述大师,一位拥有50年品牌落地项目经验的专业顾问。

我擅长帮助企业和个人品牌:
- 挖掘并提炼独特的品牌DNA和核心价值
- 构建完整的品牌叙事体系,让品牌故事深入人心
- 设计多场景的内容策略,从官网到社交媒体全覆盖
- 提供可落地执行的品牌故事方案和传播策略

请告诉我,您的品牌是做什么的?您希望在品牌故事方面获得什么样的帮助呢?`,
      "10010": `👋 您好!我是您的目标受众分析顾问,拥有50年落地项目经验,专注于帮助企业和个人精准洞察目标用户,制定有效的市场策略。

我能为您做什么?
✅ 构建立体化的用户画像
✅ 挖掘深层次的需求痛点
✅ 设计精准的市场细分策略
✅ 提供可落地的执行方案
✅ 建立长效的受众研究机制

现在,让我们开始吧!请您告诉我:
1. 您的业务领域是什么?(例如:电商、教育、SaaS、消费品等)
2. 此次分析的主要目的是什么?(例如:开发新产品、优化营销、拓展市场等)
3. 您目前对目标受众的了解程度如何?(完全不清楚/有初步想法/已有部分数据)

期待与您深入交流! 🎯`,
      "10011": `您好!我是您的竞争对手深度分析专家,拥有50年的实战项目经验。我专注于帮助企业深入了解竞争对手,制定有效的差异化竞争策略。

我能为您提供的服务包括:
- 系统化的竞争对手多维度分析
- 基于数据的客观洞察和战略建议
- 可落地的差异化竞争方案
- 持续的竞争监测机制设计

现在,请告诉我:
- 您所在的行业是什么?
- 您希望分析哪些竞争对手?(可以是具体公司名称或竞争对手类型)
- 您最关注竞争对手的哪些方面?(如产品、定价、营销、技术等)
- 这次分析的主要目的是什么?(如制定战略、产品改进、市场进入等)

让我们开始这次深度的竞争分析之旅吧! 🎯`,
      "10012": `你好，我是拥有50年全球一线品牌实战经验的品牌差异化战略大师。在当今极度内卷的市场环境中，我擅长帮助企业在红海中撕开一道口子，建立不可复制的品牌护城河。

我的核心理念："在商业战争中，不做第一，就做唯一。平庸是最大的风险。"

请告诉我您的品牌背景、核心产品以及目前最大的竞争困惑，以便开始诊断。`,
      "10013": `你好，我是拥有50年落地经验的品牌扩展战略大师。我专精于品牌资产延伸、跨界战略规划与新业务落地。

请简要描述：
1. 目前的品牌名称及核心主营业务是什么？
2. 为什么想要做品牌扩展？（遇到了增长瓶颈、发现了新机会、还是资源过剩？）
3. 目前有没有初步想进入的新品类或新市场？

告诉我这些，我将为你通过实战视角进行诊断。`,
      "10014": `您好!我是您的品牌风险管理专家顾问,拥有50年品牌风险管理实战经验。我专注于帮助企业识别、评估和应对各类品牌风险,保护和提升品牌价值。

我能为您提供的核心服务包括:
- 🔍 品牌风险全面诊断与评估
- 🛡️ 风险防控体系设计与建设
- 🚨 危机应对预案制定与演练
- 💼 品牌声誉管理与修复指导
- 📊 行业案例分析与最佳实践分享

请告诉我:
1. 您的企业所处行业和规模?
2. 您目前最关注的品牌风险是什么?
3. 您希望解决的具体问题或达成的目标?

让我们一起构建坚实的品牌防护体系!`,
      "10015": `👋 您好!我是您的年度品牌战略计划专家,拥有50年的品牌战略落地项目经验。

我专注于帮助企业建立系统化、可落地的年度品牌战略计划。无论您是初创品牌需要从0到1的品牌建设,还是成熟品牌需要战略升级,我都能为您提供专业的咨询和解决方案。

为了更好地为您服务,我想了解:
1. 您的企业和品牌:所属行业、品牌阶段(新品牌/成长期/成熟品牌)
2. 当前面临的挑战:品牌建设中最困扰您的问题是什么?
3. 核心诉求:您希望通过年度品牌战略计划实现什么目标?

请随时分享您的情况,我将为您量身定制专业的品牌战略解决方案! 🚀`,
    };
    return welcomeMessages[templateId] || welcomeMessages["10001"];
  };

  // 初始化欢迎消息（所有品牌战略子类型）
  useEffect(() => {
    const brandStrategyTemplateIds = ["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010", "10011", "10012", "10013", "10014", "10015"];
    if (brandStrategyTemplateIds.includes(templateId) && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(templateId),
        isCollapsed: false
      }]);
    }
  }, [templateId]);

  // 滚动到底部
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 收起/展开消息
  const handleToggleCollapse = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, isCollapsed: !msg.isCollapsed }
        : msg
    ));
  };

  // Markdown转纯文本
  const markdownToPlainText = (markdown: string): string => {
    return markdown
      // 移除标题标记
      .replace(/^#{1,6}\s+/gm, '')
      // 移除粗体和斜体
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/___(.+?)___/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // 移除链接，保留文本
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      // 移除图片
      .replace(/!\[.*?\]\(.+?\)/g, '')
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.+?)`/g, '$1')
      // 移除引用
      .replace(/^>\s+/gm, '')
      // 移除列表标记
      .replace(/^[\*\-\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // 移除水平线
      .replace(/^[\-\*_]{3,}$/gm, '')
      // 清理多余空行
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // 输入框高度自适应
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    // 重置高度以获取正确的scrollHeight
    const target = e.target;
    target.style.height = '60px';

    // 计算新高度
    const scrollHeight = target.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, 60), 150);
    setInputHeight(newHeight);
    target.style.height = `${newHeight}px`;
  };

  // Enter发送，Shift+Enter换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 获取当前模板对应的API端点
  const getApiEndpoint = (templateId: string): string => {
    switch (templateId) {
      case "10001": return "/api/brand-strategy/company-intro";
      case "10002": return "/api/brand-strategy/positioning-slogan";
      case "10003": return "/api/brand-strategy/brand-house";
      case "10004": return "/api/brand-strategy/positioning-report";
      case "10005": return "/api/brand-strategy/vision-mission";
      case "10006": return "/api/brand-strategy/value-proposition";
      case "10007": return "/api/brand-strategy/positioning-map";
      case "10008": return "/api/brand-strategy/architecture";
      case "10009": return "/api/brand-strategy/story-narrative";
      case "10010": return "/api/brand-strategy/audience-analysis";
      case "10011": return "/api/brand-strategy/competitor-analysis";
      case "10012": return "/api/brand-strategy/differentiation";
      case "10013": return "/api/brand-strategy/extension-plan";
      case "10014": return "/api/brand-strategy/risk-management";
      case "10015": return "/api/brand-strategy/annual-plan";
      default: return "/api/brand-strategy/company-intro";
    }
  };

  // 统一的对话历史状态（替代reportConversationHistory）
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  // 公众号文章相关状态（仅用于模板109, 201, 204）
  const [articleConversationHistory, setArticleConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [articleTheme, setArticleTheme] = useState("");
  const [articleFollowUp, setArticleFollowUp] = useState("");

  // 发送消息（所有小红书子类型统一使用）
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 检查修改次数限制
    if (conversationHistory.length >= 10) {
      setError("已达到最大对话轮次（5轮），请点击\"新建对话\"开始新的创作");
      return;
    }

    const userContent = inputValue.trim();

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userContent,
      isCollapsed: false
    };
    setMessages(prev => [...prev, userMessage]);

    // 清空输入框
    setInputValue('');
    setInputHeight(60);
    if (inputRef.current) {
      inputRef.current.style.height = '60px';
    }

    // 调用API
    setIsLoading(true);
    setError('');

    try {
      const apiEndpoint = getApiEndpoint(templateId);
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userContent,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || '生成失败');
      }

      // 添加AI回复（清理markdown格式）
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: cleanMarkdownClient(data.result),
        isCollapsed: false
      };
      setMessages(prev => [...prev, aiMessage]);
      // 刷新积分显示
      refreshCredits();

      // 将AI回复转换为纯文本并同步到富文本编辑器
      const plainText = markdownToPlainText(data.result);
      setCurrentResult(plainText);

      // 更新对话历史
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userContent },
        { role: 'assistant', content: data.result }
      ]);

      // 如果用户已登录且没有当前对话ID，自动创建对话并保存
      if (userId && !currentConversationId) {
        try {
          const title = userContent.slice(0, 30) + (userContent.length > 30 ? '...' : '');
          const conversationType = getBrandStrategyTypeByTemplateId(activeTemplate.toString());
          const convId = await createConversation(userId, title, conversationType);
          setCurrentConversationId(convId);

          // 保存消息到数据库
          await addMessage(convId, 'user', userContent);
          await addMessage(convId, 'assistant', data.result);

          // 刷新历史记录列表
          const conversations = await getConversations(userId, undefined, conversationType);
          setHistoryConversations(conversations);
        } catch (dbError) {
          console.error('保存到数据库失败:', dbError);
          // 不影响用户体验，继续显示结果
        }
      } else if (userId && currentConversationId) {
        // 如果已有对话ID，直接保存消息
        try {
          await addMessage(currentConversationId, 'user', userContent);
          await addMessage(currentConversationId, 'assistant', data.result);
        } catch (dbError) {
          console.error('保存消息失败:', dbError);
        }
      }

      // 滚动到底部
      scrollToBottom();

    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请重试");
      // 如果失败，移除用户消息
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
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

  // 清空公众号文章对话历史（新对话）
  const handleNewConversation = () => {
    setArticleConversationHistory([]);
    setCurrentResult("");
    setArticleTheme("");
    setArticleFollowUp("");
    setError("");
  };

  // 清空沟通协作模板对话历史（新对话）- 适用于所有沟通协作子类型
  const handleCommunicationNewConversation = () => {
    setConversationHistory([]);
    setCurrentResult("");
    setError("");
    setCurrentConversationId(null); // 重置对话ID
    setInputValue(""); // 清空输入框

    // 所有品牌战略子类型：重置消息列表为对应的欢迎消息
    const brandStrategyTemplateIds = ["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010", "10011", "10012", "10013", "10014", "10015"];
    if (brandStrategyTemplateIds.includes(templateId)) {
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: getWelcomeMessage(templateId),
        isCollapsed: false
      }]);
      setInputHeight(60); // 重置输入框高度
      if (inputRef.current) {
        inputRef.current.style.height = '60px';
      }
    }
  };


  return (
    <div className="flex h-[calc(100vh-56px)]">
      {["10001", "10002", "10003", "10004", "10005", "10006", "10007", "10008", "10009", "10010", "10011", "10012", "10013", "10014", "10015"].includes(templateId) ? (
        /* 所有品牌战略子类型：统一使用对话模式UI */
        <div className="w-full flex flex-col">
          {/* 统一的顶部标题栏 */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              {/* 左侧：返回 + 标题 */}
              <div className="flex items-center gap-4">
                <BackButton />
                <h1 className="text-lg font-semibold text-foreground">
                  {templateTitle}
                </h1>
              </div>

              {/* 中间：新建对话 + 历史记录 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCommunicationNewConversation}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  新建对话
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResultTab("history")}
                  className="h-8"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  历史记录
                </Button>
              </div>

              {/* 右侧：文本编辑器标题 + 复制 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResultTab("current")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  文本编辑器
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(currentResult);
                  }}
                  disabled={!currentResult}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </Button>
              </div>
            </div>
          </div>

          {/* 主内容区域：左右分栏 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 左侧：对话框区域 (50%) */}
            <div className="w-[50%] flex flex-col border-r border-border">
              {/* 对话消息区域 */}
              <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      isCollapsed={msg.isCollapsed}
                      onToggleCollapse={() => handleToggleCollapse(msg.id)}
                      isRichText={false}
                    />
                  ))}

                  {/* 加载状态 */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4 shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                    </div>
                  )}

                  {/* 滚动锚点 */}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 底部输入区域 */}
              <div className="border-t border-border p-4 bg-background">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="输入您的需求...（Enter发送，Shift+Enter换行）"
                    className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    style={{ height: `${inputHeight}px`, maxHeight: '150px', overflowY: 'auto' }}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    size="lg"
                    className="px-6"
                    style={{ height: `${inputHeight}px` }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>

                {/* 错误提示 */}
                {error && (
                  <p className="text-sm text-destructive mt-2">{error}</p>
                )}

                {/* 对话轮次提示 */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    对话轮次：{Math.floor(conversationHistory.length / 2)}/5
                    {conversationHistory.length >= 10 && " - 已达到最大轮次，请新建对话"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    💡 提示：Enter发送，Shift+Enter换行
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧：文本编辑器/历史记录区域 (50%) */}
            <div className="w-[50%] flex flex-col bg-card">
              {resultTab === "current" ? (
                /* 文本编辑器 */
                <div className="flex-1 overflow-hidden">
                  {currentResult ? (
                    <RichTextEditor
                      initialContent={currentResult}
                      className="h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p className="text-sm">AI生成的内容将显示在这里</p>
                    </div>
                  )}
                </div>
              ) : (
                /* 历史记录 */
                <ScrollArea className="flex-1">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                      <p className="text-sm text-muted-foreground">加载历史记录中...</p>
                    </div>
                  ) : historyConversations.length > 0 ? (
                    <div className="p-4 space-y-3">
                      {historyConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={async () => {
                            // 加载历史对话
                            try {
                              const { getConversationWithMessages } = await import('@/lib/conversations');
                              const conv = await getConversationWithMessages(conversation.id);

                              if (conv && conv.messages) {
                                // 恢复对话历史（清理markdown格式）
                                const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
                                const msgs = conv.messages.map(msg => {
                                  const cleanedContent = msg.role === 'assistant'
                                    ? cleanMarkdownClient(msg.content)
                                    : msg.content;
                                  history.push({
                                    role: msg.role as 'user' | 'assistant',
                                    content: cleanedContent
                                  });
                                  return {
                                    id: msg.id,
                                    role: msg.role as 'user' | 'assistant',
                                    content: cleanedContent,
                                    isCollapsed: false
                                  };
                                });

                                setConversationHistory(history);
                                setMessages(msgs);
                                setCurrentConversationId(conversation.id);

                                // 显示最后一条AI回复（清理markdown格式）
                                const lastAssistantMsg = conv.messages
                                  .filter(m => m.role === 'assistant')
                                  .pop();
                                if (lastAssistantMsg) {
                                  const plainText = markdownToPlainText(cleanMarkdownClient(lastAssistantMsg.content));
                                  setCurrentResult(plainText);
                                }

                                // 切换到当前创作结果标签
                                setResultTab('current');
                              }
                            } catch (error) {
                              console.error('加载对话失败:', error);
                              alert('加载对话失败，请重试');
                            }
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium text-foreground line-clamp-1">
                              {conversation.title}
                            </h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {new Date(conversation.created_at).toLocaleDateString('zh-CN', {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            点击查看完整对话
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
                      {!userId && (
                        <p className="text-xs text-muted-foreground mt-2">
                          请先登录以保存和查看历史记录
                        </p>
                      )}
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 其他模板：原有的左右分栏布局 */
        <>
      {/* Center - Form Area */}
      <div className="w-[60%] flex flex-col overflow-hidden">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <BackButton className="mb-6" />

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              {templateTitle}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCommunicationNewConversation}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                新建对话
              </Button>
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
                : templateId === "108"
                ? "👋 哈喽宝子们！我是你们的小红书爆款种草专家呱呱！✨ 不管你是想推美妆神仙水🧴、硬核黑科技💻，还是家居好物🛋️，我都能帮你把草种到用户的心坎里！🌱 把信息甩给我，剩下的爆款文案交给我来搞定！💪🔥"
                : templateId === "109" || templateId === "201" || templateId === "204"
                ? "📝 你好！我是公众号爆款文章-大纲架构师！我擅长深度拆解主题、逻辑构建、场景化痛点挖掘和实操方法论转化。基于经过验证的'七步高转化逻辑框架'，我将为你生成逻辑严密、读者粘性强且具有高度可执行性的文章大纲。准备好打造高质量公众号文章了吗？✨"
                : templateId === "103"
                ? "👋 你好呀！我是你的小红书爆款标题大师，拥有50年的标题创作经验，帮助过无数创作者打造出10w+阅读的爆款笔记！请告诉我你的笔记内容主题、目标人群和账号定位，让我为你创作3-5个不同风格的标题方案！🚀"
                : templateId === "102"
                ? "👋 你好呀！我是你的小红书爆款文案大师，拥有50年内容创作经验，已经帮助无数创作者打造出10w+点赞的爆款笔记。我精通小红书平台的流量密码，深谙用户心理，能够为你量身定制高互动、高转化的优质文案！✨"
                : `欢迎来到${templateTitle}创作空间！让我们一起探索如何创作出能够吸引用户注意力的内容。请告诉我你想要聚焦的主题或领域，让我们开始创作吧！`
              }
            </p>
          </div>

          {/* Input Form - 已移除，所有小红书子类型使用统一对话模式 */}
          <div className="space-y-4">
            {templateId === "109" || templateId === "201" || templateId === "204" ? (
              <>
                {/* 公众号文章专用表单 */}

                {/* 对话历史管理 */}
                {articleConversationHistory.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          💬 对话历史 ({articleConversationHistory.length / 2} 轮)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNewConversation}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        新对话
                      </Button>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      ✨ AI 会基于完整的对话历史进行回答，确保上下文连贯。点击"新对话"开始全新的文章创作。
                    </p>
                  </div>
                )}

                {/* 文章主题 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center justify-between">
                    <span>📝 文章主题</span>
                    {articleConversationHistory.length === 0 && (
                      <span className="text-xs text-gray-500">首次创作</span>
                    )}
                    {articleConversationHistory.length > 0 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">继续追问</span>
                    )}
                  </label>
                  <Input
                    placeholder={
                      articleConversationHistory.length === 0
                        ? "例如：如何从零开始养成早起习惯、职场新人如何高效复盘..."
                        : "例如：能不能针对第4部分补充更多具体步骤？"
                    }
                    value={articleTheme}
                    onChange={(e) => setArticleTheme(e.target.value)}
                  />
                </div>

                {/* 追问/补充要求（可选） - 仅在首次创作时显示 */}
                {articleConversationHistory.length === 0 && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                      💡 补充要求（可选）
                    </label>
                    <Textarea
                      placeholder="如果你对生成的大纲有特殊要求，可以在这里补充说明，比如：需要更多案例、希望增加某个环节的内容等..."
                      className="min-h-[100px] resize-none"
                      value={articleFollowUp}
                      onChange={(e) => setArticleFollowUp(e.target.value)}
                    />
                  </div>
                )}

                {/* 继续提问提示 */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                    💬 <strong>提示：</strong>
                    {articleConversationHistory.length === 0 ? (
                      <>
                        生成大纲后，你可以继续提问修改，比如：
                        <br />• "能不能针对第4部分补充更多具体步骤？"
                        <br />• "可以增加一些心理学原理的解释吗？"
                        <br />• "能不能提供更多实用工具推荐？"
                        <br />• "案例部分能不能更详细一些？"
                      </>
                    ) : (
                      <>
                        你正在进行第 {articleConversationHistory.length / 2 + 1} 轮对话，AI 会记住之前的所有内容。
                        <br />• 可以直接说"第4部分"、"刚才的案例"等，AI 会理解
                        <br />• 想开始新的文章创作？点击上方"新对话"按钮
                      </>
                    )}
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

                {/* 小红书模板对话历史和修改功能 - 已移除，使用统一对话模式 */}

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
                      onClick={async () => {
                        // 保存到历史记录
                        if (!userId) {
                          alert("请先登录后再保存");
                          return;
                        }

                        if (!currentResult) {
                          alert("没有内容可保存");
                          return;
                        }

                        try {
                          let convId = currentConversationId;

                          // 如果没有当前对话ID，创建新对话
                          if (!convId) {
                            const title = currentResult.slice(0, 30) + (currentResult.length > 30 ? '...' : '');
                            const conversationType = getBrandStrategyTypeByTemplateId(activeTemplate.toString());
                            convId = await createConversation(userId, title, conversationType);
                            setCurrentConversationId(convId);

                            // 保存对话历史
                            for (let i = 0; i < conversationHistory.length; i += 2) {
                              const userMsg = conversationHistory[i];
                              const assistantMsg = conversationHistory[i + 1];
                              if (userMsg && assistantMsg) {
                                await addMessage(convId, 'user', userMsg.content);
                                await addMessage(convId, 'assistant', assistantMsg.content);
                              }
                            }
                          }

                          // 刷新历史记录列表
                          const conversations = await getConversations(userId, undefined, 'report');
                          setHistoryConversations(conversations);

                          alert("保存成功！");
                        } catch (error) {
                          console.error('保存失败:', error);
                          alert("保存失败，请重试");
                        }
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
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">加载历史记录中...</p>
                </div>
              ) : historyConversations.length > 0 ? (
                <div className="p-4 space-y-3">
                  {historyConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={async () => {
                        // 加载历史对话
                        try {
                          const { getConversationWithMessages } = await import('@/lib/conversations');
                          const conv = await getConversationWithMessages(conversation.id);

                          if (conv && conv.messages) {
                            // 恢复对话历史（清理markdown格式）
                            const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
                            conv.messages.forEach(msg => {
                              const cleanedContent = msg.role === 'assistant'
                                ? cleanMarkdownClient(msg.content)
                                : msg.content;
                              history.push({
                                role: msg.role as 'user' | 'assistant',
                                content: cleanedContent
                              });
                            });
                            setConversationHistory(history);

                            // 恢复消息列表(模板102)（清理markdown格式）
                            if (templateId === "102") {
                              const msgs = conv.messages.map(msg => ({
                                id: msg.id,
                                role: msg.role as 'user' | 'assistant',
                                content: msg.role === 'assistant'
                                  ? cleanMarkdownClient(msg.content)
                                  : msg.content,
                                isCollapsed: false
                              }));
                              setMessages(msgs);
                            }

                            // 设置当前对话ID
                            setCurrentConversationId(conversation.id);

                            // 显示最后一条AI回复（清理markdown格式）
                            const lastAssistantMsg = conv.messages
                              .filter(m => m.role === 'assistant')
                              .pop();
                            if (lastAssistantMsg) {
                              setCurrentResult(cleanMarkdownClient(lastAssistantMsg.content));
                            }

                            // 切换到当前创作结果标签
                            setResultTab('current');
                          }
                        } catch (error) {
                          console.error('加载对话失败:', error);
                          alert('加载对话失败，请重试');
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">
                          {conversation.title}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(conversation.created_at).toLocaleDateString('zh-CN', {
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        点击查看完整对话
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
                  {!userId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      请先登录以保存和查看历史记录
                    </p>
                  )}
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
      </>
      )}
    </div>
  );
}
