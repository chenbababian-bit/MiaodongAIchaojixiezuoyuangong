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
import { speechesTemplates } from "@/lib/general-templates";
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

export function SpeechesWritingPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "演讲发言";
  const templateId = searchParams.get("template") || "1101";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  // 演讲发言模块的类型映射函数
  const getSpeechesTypeByTemplateId = (templateId: string): ConversationType => {
    const mapping: Record<string, ConversationType> = {
      '1201': 'speeches-onboarding-welcome',
      '1202': 'speeches-department-intro',
      '1203': 'speeches-project-kickoff',
      '1204': 'speeches-team-building-opening',
      '1205': 'speeches-year-end-summary',
      '1206': 'speeches-annual-meeting',
      '1207': 'speeches-award-ceremony',
      '1208': 'speeches-retirement-farewell',
      '1209': 'speeches-sales-motivation',
      '1210': 'speeches-culture-promotion',
      '1211': 'speeches-onboarding-speech',
      '1212': 'speeches-probation-review',
    };
    return mapping[templateId] || 'speeches-onboarding-welcome';
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
        case "speeches":
          return speechesTemplates.map((t: any) => ({
            id: t.id,
            icon: "speeches",
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
        const conversationType = getSpeechesTypeByTemplateId(activeTemplate.toString());
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
    // 演讲发言模板的欢迎消息
    const welcomeMessages: Record<string, string> = {
      "1201": `您好！我是您的专属入职欢迎辞专家，拥有50年的落地项目经验。我深知一场真诚而专业的入职欢迎对于新员工融入团队的重要性。

我能为您提供的服务包括：
- 为各类入职场景量身定制专业欢迎辞
- 优化和升级您现有的欢迎辞内容
- 设计完整的欢迎仪式流程
- 提供不同风格和调性的多种方案
- 根据企业文化进行深度个性化定制

我的工作流程是：
首先，我会通过几个关键问题了解您的具体需求和企业背景；然后，基于这些信息为您设计个性化的欢迎辞方案；接下来，我们可以一起对方案进行优化调整，直到您完全满意；最后，我还可以为您提供使用建议和扩展服务。

现在，让我们开始吧！请告诉我：

1. 您需要欢迎辞的对象是？（新员工/中高层管理者/团队/其他）
2. 您的企业属于什么行业？大概多少人规模？
3. 您期望的欢迎辞风格是？（正式庄重/亲切温暖/活泼创新/其他）
4. 这次欢迎的具体场景是？（入职大会/部门会议/一对一/线上/其他）

期待与您合作，打造一场令人难忘的入职欢迎体验！`,
      "1202": `您好！我是您的专属部门介绍演讲大师，拥有50年的实战项目经验。我专注于帮助您打造专业、有说服力的部门介绍演讲方案。

我能为您提供：
- 演讲策划与演讲稿撰写
- 专业PPT演示文稿制作
- 数据可视化与成果包装
- 针对不同受众的定制化方案
- 实用演讲技巧指导

我们的工作流程：
1. 需求诊断 - 了解您的演讲场景、受众和目标
2. 方案设计 - 为您提供多套结构方案选择
3. 内容创作 - 撰写演讲稿并制作PPT文档
4. 优化完善 - 根据反馈调整优化
5. 交付支持 - 提供文件和演讲技巧指导

请告诉我：
- 您需要准备什么类型的部门介绍演讲？（如年度汇报、新部门介绍、预算申请等）
- 您的受众是谁？（高层领导、同级部门、外部合作方等）
- 演讲时长有什么要求？

让我们开始打造您的精彩演讲！`,
      "1203": `你好，我是你的项目启动演说大师。这50年来，我见过无数项目起高楼，也见过无数项目宴宾客，区别往往就在启动的那一口气上。

为了帮你打造一场震撼人心的启动演讲，请告诉我：
1. 这是个什么项目？（软件、基建、变革、还是救火？）
2. 你的听众是谁？（高管、一线员工、还是挑剔的甲方？）
3. 你现在最大的担忧是什么？（士气低落、时间紧迫、还是目标不清？）
4. 你希望这场演讲达到什么核心目的？

请回答以上问题，我们立马开始。`,
      "1204": `您好！我是您的团队建设活动开场白专家顾问，拥有50年项目落地经验。我专注于帮助您设计富有感染力、高参与度的活动开场，让您的团队建设活动从第一分钟就充满活力！

我能为您做什么：
- 定制专属开场白脚本（可直接使用的话术）
- 设计破冰互动环节（提升参与感）
- 传授现场掌控技巧（肢体语言、声音运用）
- 准备应急预案（应对冷场等突发状况）
- 优化您现有的开场内容

接下来我们这样合作：
1. 我会先了解您的活动具体情况
2. 然后为您量身设计完整的开场方案
3. 提供实战技巧和注意事项
4. 根据您的反馈持续优化

请告诉我您的活动信息，比如：
- 活动类型（年会/拓展训练/培训/团建等）
- 参与人数和构成
- 活动时长和场地
- 您希望达成的目标
- 团队的特点或特殊需求

让我们一起打造一个令人难忘的精彩开场！`,
      "1205": `您好！我是您的专业年终总结大会发言稿撰写助手

我擅长撰写年终总结大会发言稿，帮助您全面回顾年度工作、展现团队成果、激发员工士气。

请告诉我以下信息：
1. 您的职位和部门
2. 本年度的主要工作成果和亮点
3. 团队的重要数据和指标
4. 面临的挑战和解决方案
5. 下一年的工作展望

让我们开始创作一份精彩的年终总结发言稿吧！`,
      "1206": `您好！我是您的专业年会发言稿撰写助手

我擅长撰写年会发言稿，帮助您营造欢乐氛围、总结年度成就、展望美好未来。

请告诉我以下信息：
1. 您的职位和角色
2. 年会的主题和氛围
3. 本年度的重要成就
4. 对员工的感谢和肯定
5. 新年的期望和祝福

让我们开始创作一份温暖而振奋人心的年会发言稿吧！`,
      "1207": `您好！我是您的专业表彰大会发言稿撰写助手

我擅长撰写表彰大会发言稿，帮助您充分肯定获奖者成就、激发全体员工积极性。

请告诉我以下信息：
1. 表彰的对象和奖项
2. 获奖者的突出贡献和事迹
3. 对其他员工的激励和期望
4. 企业的价值观和文化
5. 未来的发展方向

让我们开始创作一份鼓舞人心的表彰大会发言稿吧！`,
      "1208": `您好！我是您的专业退休告别演讲撰写助手

我擅长撰写退休告别演讲，帮助您回顾职业生涯、表达感激之情、传递人生智慧。

请告诉我以下信息：
1. 您的工作年限和主要岗位
2. 职业生涯中的难忘经历
3. 对同事和公司的感谢
4. 对后辈的寄语和建议
5. 退休后的生活规划

让我们开始创作一份感人至深的退休告别演讲吧！`,
      "1209": `您好！我是您的专业销售激励演讲撰写助手

我擅长撰写销售激励演讲，帮助您激发销售团队斗志、提升销售业绩。

请告诉我以下信息：
1. 当前的销售形势和挑战
2. 团队的优势和潜力
3. 成功案例和榜样
4. 激励措施和奖励政策
5. 销售目标和行动计划

让我们开始创作一份充满激情的销售激励演讲吧！`,
      "1210": `您好！我是您的专业公司文化宣讲撰写助手

我擅长撰写公司文化宣讲内容，帮助您清晰传达企业价值观、激发员工认同感。

请告诉我以下信息：
1. 公司的使命、愿景和价值观
2. 企业文化的核心要素
3. 文化落地的典型案例
4. 对员工的期望和要求
5. 文化建设的未来规划

让我们开始创作一份深入人心的公司文化宣讲内容吧！`,
      "1211": `您好！我是您的专业入职发言稿撰写助手

我擅长撰写入职发言稿，帮助您展现个人特点、表达加入决心、快速融入团队。

请告诉我以下信息：
1. 您的姓名和新岗位
2. 您的教育和工作背景
3. 选择加入公司的原因
4. 对新工作的期待和规划
5. 对团队的感谢和承诺

让我们开始创作一份真诚而专业的入职发言稿吧！`,
      "1212": `您好！我是您的专业转正述职报告演讲稿撰写助手

我擅长撰写转正述职报告演讲稿，帮助您展现试用期成果、体现岗位胜任力、提高转正成功率。

请告诉我以下信息：
1. 入职时间和岗位职责
2. 试用期的主要工作内容
3. 取得的成果和数据支撑
4. 个人能力的提升和成长
5. 转正后的工作计划

让我们开始创作一份专业的转正述职报告演讲稿吧！`
    };
    return welcomeMessages[templateId] || welcomeMessages["1201"];
  };

  // 初始化欢迎消息（所有演讲发言子类型）
  useEffect(() => {
    const speechesTemplateIds = ["1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212"];
    if (speechesTemplateIds.includes(templateId) && messages.length === 0) {
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
      case "1201": return "/api/speeches/onboarding-welcome";
      case "1202": return "/api/speeches/department-intro";
      case "1203": return "/api/speeches/project-kickoff";
      case "1204": return "/api/speeches/team-building-opening";
      case "1205": return "/api/speeches/year-end-summary";
      case "1206": return "/api/speeches/annual-meeting";
      case "1207": return "/api/speeches/award-ceremony";
      case "1208": return "/api/speeches/retirement-farewell";
      case "1209": return "/api/speeches/sales-motivation";
      case "1210": return "/api/speeches/culture-promotion";
      case "1211": return "/api/speeches/onboarding-speech";
      case "1212": return "/api/speeches/probation-review";
      default: return "/api/speeches/onboarding-welcome";
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
          const conversationType = getSpeechesTypeByTemplateId(activeTemplate.toString());
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

    // 所有演讲发言子类型：重置消息列表为对应的欢迎消息
    const speechesTemplateIds = ["1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212"];
    if (speechesTemplateIds.includes(templateId)) {
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
      {["1201", "1202", "1203", "1204", "1205", "1206", "1207", "1208", "1209", "1210", "1211", "1212"].includes(templateId) ? (
        /* 所有演讲发言子类型：统一使用对话模式UI */
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
                            const conversationType = getSpeechesTypeByTemplateId(activeTemplate.toString());
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
