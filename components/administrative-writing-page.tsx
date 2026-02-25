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
import { administrativeTemplates } from "@/lib/general-templates";
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

export function AdministrativeWritingPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "事务公文";
  const templateId = searchParams.get("template") || "2101";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  // 事务公文模块的类型映射函数
  const getAdministrativeTypeByTemplateId = (templateId: string): ConversationType => {
    const mapping: Record<string, ConversationType> = {
      '2101': 'administrative-report-material',
      '2102': 'administrative-inspection-report',
      '2103': 'administrative-supervision-notice',
      '2104': 'administrative-evaluation-report',
      '2105': 'administrative-emergency-plan',
      '2106': 'administrative-project-application',
      '2107': 'administrative-contract-agreement',
      '2108': 'administrative-legal-opinion',
      '2109': 'administrative-work-plan',
      '2110': 'administrative-work-summary',
      '2111': 'administrative-research-report',
      '2112': 'administrative-meeting-minutes',
    };
    return mapping[templateId] || 'administrative-report-material';
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
        case "administrative":
          return administrativeTemplates.map((t: any) => ({
            id: t.id,
            icon: "administrative",
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
        const conversationType = getAdministrativeTypeByTemplateId(activeTemplate.toString());
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
    // 事务公文模板的欢迎消息
    const welcomeMessages: Record<string, string> = {
      "2101": `您好!我是您的专属公文写作顾问，拥有50年落地项目经验，专注于各类政务公文、工作汇报、项目材料的专业撰写。

我的专长包括：
✓ 工作总结/汇报/述职报告
✓ 项目申报书/可行性研究报告
✓ 请示/报告/函件等法定公文
✓ 领导讲话稿/会议材料
✓ 政策解读/实施方案

我的工作流程是：
1. 需求诊断阶段 - 询问材料类型和具体用途
2. 框架搭建阶段 - 提出材料整体结构建议
3. 内容撰写阶段 - 按照确认的框架展开撰写
4. 审核优化阶段 - 自查材料的逻辑性和完整性
5. 交付指导阶段 - 提供最终版本材料

现在，请告诉我您需要撰写什么类型的材料？或者您可以直接分享现有材料，我来帮您诊断优化。让我们开始吧！`,
      "2102": `您好!我是您的专业事务公文检查报告撰写专家，拥有50年落地项目经验，专注于各类事务公文的质量把控和检查报告撰写。

我的工作流程如下：
1. 📄 接收您的公文 - 了解文档类型和检查需求
2. 🔍 四轮系统检查 - 格式→内容→语言→合规性全面审查
3. 📋 梳理问题清单 - 分类整理，标注严重程度
4. 📊 撰写检查报告 - 结构化呈现，提供具体改进建议
5. 💬 交付与指导 - 解答疑问，提供后续支持

请您上传需要检查的公文文档，并告诉我：
- 这是什么类型的公文?(请示/报告/通知/函等)
- 主要用途是什么?
- 是否有特殊的检查要求?

我将为您提供最专业、最详尽的检查报告！`,
      "2103": `您好！我是一位拥有50年落地项目经验的专业督查报告撰写大师，专注于各类督查报告的撰写、优化和指导工作。

我的核心能力包括：
✅ 各类督查报告的专业撰写（政府督查、项目督查、专项督查等）
✅ 深度问题分析和原因诊断
✅ 切实可行的整改方案设计
✅ 公文格式规范和语言润色

我的工作流程：
1. 📋 需求确认 - 了解您的督查类型、背景和具体需求
2. 📊 信息收集 - 收集相关资料、数据和发现的问题
3. 🏗️ 框架搭建 - 设计符合您需求的报告结构
4. ✍️ 内容撰写 - 逐部分撰写专业规范的报告内容
5. 🔍 优化完善 - 检查优化,确保质量
6. 📤 交付确认 - 提供完整报告并提供后续建议

请告诉我：您需要撰写什么类型的督查报告？或者您有什么具体的需求和问题？我将为您提供最专业的帮助！`,
      "2104": `您好！我是您的专业项目评估报告撰写专家，拥有50年项目落地经验。

我能够为您提供：
✅ 各类项目评估报告的专业撰写服务
✅ 符合国家标准和行业规范的公文格式
✅ 深度的项目分析和风险评估
✅ 可操作的决策建议和实施方案

我的工作流程是：
1. 需求沟通 - 深入了解您的项目信息和报告需求
2. 框架设计 - 为您定制专业的评估框架和结构
3. 分析评估 - 进行全面深入的项目分析
4. 报告撰写 - 产出专业、严谨的评估报告
5. 审核交付 - 确保质量并根据反馈优化
6. 后续支持 - 提供使用指导和答疑服务

现在，请告诉我：
- 您需要什么类型的评估报告？（可行性研究/后评估/风险评估/绩效评估等）
- 项目属于哪个行业和领域？
- 项目目前处于什么阶段？
- 报告的主要用途是什么？

让我们开始为您打造一份高质量的专业评估报告吧！📊`,
      "2105": `您好!我是应急预案与公文撰写专家，拥有50年实战项目经验，专注于:

✅ 应急预案编制 - 各类突发事件应急预案、专项预案、现场处置方案
✅ 公文撰写服务 - 通知、报告、请示、方案等15种法定公文
✅ 项目落地支持 - 预案演练、培训指导、风险评估

我的优势:
- 📚 精通应急管理法规体系与公文写作规范
- 🎯 擅长将理论转化为可落地执行的方案
- 💡 提供定制化、专业化、实战化的解决方案

请告诉我您的具体需求：
1. 您需要编制什么类型的应急预案?还是撰写公文?
2. 您所在的单位性质和行业是什么?
3. 有什么特殊要求或侧重点吗?

期待为您提供专业服务!🤝`,
      "2106": `您好!我是您的专属项目申请书撰写顾问，拥有50年项目申报和资金争取经验，专注于各类项目申请书、申报书、立项报告的专业撰写。

我的专长包括：
✓ 政府专项资金申请书/科研项目申请书
✓ 基础设施项目申请/产业扶持项目申请
✓ 社会事业项目申请/创新创业项目申请
✓ 可行性研究报告/项目建议书
✓ 资金预算编制/绩效目标设定

我的工作流程是：
1. 项目诊断分析 - 了解项目背景、目标和申报要求
2. 政策匹配研究 - 分析政策导向和评审要点
3. 框架结构设计 - 构建符合要求的申请书框架
4. 内容专业撰写 - 突出项目亮点和创新性
5. 预算方案编制 - 科学合理的资金使用计划

现在，请告诉我您需要申报什么类型的项目？或者您可以直接分享项目信息，我来帮您设计申请方案。让我们开始吧！`,
      "2107": `您好!我是您的专属合同协议撰写顾问，拥有50年合同管理和法律实务经验，专注于各类合同协议、法律文书的专业起草和审核。

我的专长包括：
✓ 政府采购合同/工程建设合同
✓ 服务外包合同/技术开发合同
✓ 战略合作协议/框架协议
✓ 保密协议/廉政协议
✓ 补充协议/变更协议

我的工作流程是：
1. 需求确认阶段 - 了解合同类型和交易背景
2. 条款设计阶段 - 设计完整的合同条款体系
3. 风险识别阶段 - 识别潜在法律风险点
4. 文本起草阶段 - 撰写规范严谨的合同文本
5. 审核完善阶段 - 确保合同的合法性和可执行性

现在，请告诉我您需要起草什么类型的合同？或者您可以直接分享合同需求，我来帮您专业起草。让我们开始吧！`,
      "2108": `您好!我是您的专属法律意见书撰写顾问，拥有50年法律实务和公文写作经验，专注于各类法律意见书、法律审查意见、合规性审查报告的专业撰写。

我的专长包括：
✓ 合同法律审查意见/项目法律论证意见
✓ 政策合规性审查/制度合法性审查
✓ 争议解决法律意见/诉讼风险评估
✓ 重大决策法律论证/专项法律意见
✓ 尽职调查法律意见/投资法律意见

我的工作流程是：
1. 事项分析阶段 - 了解法律问题和审查需求
2. 法律检索阶段 - 查找适用的法律法规和案例
3. 风险识别阶段 - 全面识别法律风险点
4. 意见撰写阶段 - 提出专业的法律意见和建议
5. 方案优化阶段 - 提供可行的解决方案

现在，请告诉我您需要什么类型的法律意见？或者您可以直接分享相关材料，我来帮您出具专业意见。让我们开始吧！`,
      "2109": `您好!我是您的专属工作计划撰写顾问，拥有50年政务管理和计划编制经验，专注于各类工作计划、实施方案、行动计划的专业撰写。

我的专长包括：
✓ 年度工作计划/季度工作计划
✓ 专项工作方案/重点任务计划
✓ 项目实施计划/活动组织方案
✓ 部门工作安排/个人工作计划
✓ 应急工作预案/阶段性工作部署

我的工作流程是：
1. 目标确定阶段 - 明确工作目标和预期成果
2. 任务分解阶段 - 将目标分解为具体任务
3. 资源配置阶段 - 合理配置人财物等资源
4. 进度安排阶段 - 制定科学的时间表和路线图
5. 保障措施阶段 - 确保计划落实的保障机制

现在，请告诉我您需要制定什么类型的工作计划？或者您可以直接分享工作目标，我来帮您系统规划。让我们开始吧！`,
      "2110": `您好!我是您的专属工作总结撰写顾问，拥有50年政务写作和总结提炼经验，专注于各类工作总结、述职报告、经验材料的专业撰写。

我的专长包括：
✓ 年度工作总结/半年工作总结
✓ 专项工作总结/阶段性工作总结
✓ 个人述职报告/部门工作汇报
✓ 经验交流材料/典型案例总结
✓ 项目总结报告/活动总结报告

我的工作流程是：
1. 素材收集阶段 - 全面收集工作数据和事例
2. 成绩梳理阶段 - 系统梳理工作成效和亮点
3. 问题分析阶段 - 客观分析存在的问题和不足
4. 经验提炼阶段 - 提炼可推广的经验做法
5. 谋划展望阶段 - 提出下一步工作思路

现在，请告诉我您需要撰写什么类型的工作总结？或者您可以直接分享工作情况，我来帮您系统总结。让我们开始吧！`,
      "2111": `您好!我是您的专属调研报告撰写顾问，拥有50年调查研究和报告撰写经验，专注于各类调研报告、调查报告、研究报告的专业撰写。

我的专长包括：
✓ 政策调研报告/专题调研报告
✓ 社会调查报告/市场调研报告
✓ 问题调研报告/对策研究报告
✓ 典型调研报告/蹲点调研报告
✓ 比较研究报告/跟踪调研报告

我的工作流程是：
1. 选题确定阶段 - 明确调研主题和目的
2. 方案设计阶段 - 设计科学的调研方案
3. 数据收集阶段 - 系统收集一手和二手资料
4. 分析研究阶段 - 深入分析问题和原因
5. 报告撰写阶段 - 形成有深度有见地的调研报告

现在，请告诉我您需要撰写什么类型的调研报告？或者您可以直接分享调研情况，我来帮您专业撰写。让我们开始吧！`,
      "2112": `您好!我是您的专属会议纪要撰写顾问，拥有50年会议服务和文秘工作经验，专注于各类会议纪要、会议记录、会议纪要的专业撰写。

我的专长包括：
✓ 党委会议纪要/政府常务会议纪要
✓ 专题会议纪要/办公会议纪要
✓ 座谈会纪要/协调会议纪要
✓ 工作会议记录/重要会议纪要
✓ 视频会议纪要/现场办公会纪要

我的工作流程是：
1. 会议信息确认 - 了解会议类型和主要内容
2. 要点提炼整理 - 提炼会议的核心要点
3. 结构框架设计 - 构建规范的纪要框架
4. 内容专业撰写 - 准确记录会议精神和决定
5. 审核完善定稿 - 确保纪要的准确性和规范性

现在，请告诉我您需要撰写什么类型的会议纪要？或者您可以直接分享会议内容，我来帮您规范整理。让我们开始吧！`
    };
    return welcomeMessages[templateId] || welcomeMessages["2101"];
  };

  // 初始化欢迎消息（所有事务公文子类型）
  useEffect(() => {
    const administrativeTemplateIds = ["2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "2110", "2111", "2112"];
    if (administrativeTemplateIds.includes(templateId) && messages.length === 0) {
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
      case "2101": return "/api/administrative/report-material";
      case "2102": return "/api/administrative/inspection-report";
      case "2103": return "/api/administrative/supervision-notice";
      case "2104": return "/api/administrative/evaluation-report";
      case "2105": return "/api/administrative/emergency-plan";
      default: return "/api/administrative/report-material";
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
          const conversationType = getAdministrativeTypeByTemplateId(activeTemplate.toString());
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

    // 所有事务公文子类型：重置消息列表为对应的欢迎消息
    const administrativeTemplateIds = ["2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "2110", "2111", "2112"];
    if (administrativeTemplateIds.includes(templateId)) {
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
      {["2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "2110", "2111", "2112"].includes(templateId) ? (
        /* 所有事务公文子类型：统一使用对话模式UI */
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
                            const conversationType = getAdministrativeTypeByTemplateId(activeTemplate.toString());
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
