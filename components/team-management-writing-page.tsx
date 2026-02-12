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
import { teamManagementTemplates } from "@/lib/general-templates";

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

export function TeamManagementWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "团队管理";
  const templateId = searchParams.get("template") || "1101";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  // 团队管理模块的类型映射函数
  const getTeamManagementTypeByTemplateId = (templateId: string): ConversationType => {
    const mapping: Record<string, ConversationType> = {
      '1301': 'team-management-recruitment-ad',
      '1302': 'team-management-job-description',
      '1303': 'team-management-interview-invitation',
      '1304': 'team-management-interview-feedback',
      '1305': 'team-management-offer-letter',
      '1306': 'team-management-onboarding-handbook',
      '1307': 'team-management-resignation-procedure',
      '1308': 'team-management-career-planning',
      '1309': 'team-management-training-record',
    };
    return mapping[templateId] || 'team-management-recruitment-ad';
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
        case "team-management":
          return teamManagementTemplates.map((t: any) => ({
            id: t.id,
            icon: "team-management",
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
        const conversationType = getTeamManagementTypeByTemplateId(activeTemplate.toString());
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
    // 团队管理模板的欢迎消息
    const welcomeMessages: Record<string, string> = {
      "1301": `您好!我是您的招聘广告落地专家,拥有50年的实战经验,专注于帮助企业解决招聘难题。

我的专长包括:
- 撰写高转化率的招聘文案
- 制定精准的投放渠道策略
- 塑造独特的雇主品牌形象
- 优化招聘广告投放效果
- 解决各类特殊招聘场景问题

我们的合作流程:
1. 首先,我会详细了解您的招聘需求和企业情况
2. 然后,为您制定针对性的招聘广告策略
3. 接着,创作专业的招聘文案和投放方案
4. 最后,提供持续的优化建议和执行支持

请告诉我:您目前需要招聘什么岗位?遇到了哪些具体挑战?让我为您提供专业的解决方案!`,
      "1302": `您好!我是职位描述架构大师,拥有50年落地项目经验,专注于职位描述撰写、组织架构优化和招聘策略设计。

我能为您提供:
- 精准专业的职位描述文档撰写
- 岗位职责与任职资格梳理
- 组织架构设计与优化建议
- 薪酬定位与招聘策略咨询
- 人才画像分析与面试方案

我的工作流程:
1. 首先通过结构化提问了解您的岗位需求和业务场景
2. 深入分析岗位核心价值和关键能力要求
3. 为您输出完整的职位描述文档(Markdown格式)
4. 提供配套的招聘建议和优化方案
5. 根据您的反馈持续迭代优化

请告诉我:您需要撰写或优化哪个岗位的职位描述?或者您也可以直接描述您当前在人才招聘方面遇到的具体挑战,我会为您提供专业的解决方案。`,
      "1303": `您好!我是拥有50年经验的面试邀请大师。不同于普通的HR助理,我将招聘视为"高阶销售",擅长通过心理侧写、极致文案和策略组合拳,将"已读不回"的僵尸候选人转化为"主动赴约"的求职者。

我的核心理念是:不要通知面试,要销售机会。

我能为您提供:
- 极致文案定制(Cold Email、微信打招呼语、LinkedIn InMail)
- 候选人心理侧写(从简历推演跳槽动机)
- 招聘漏斗设计(多渠道触达的最佳时间表)
- 实战模拟复盘(犀利点评现有话术)
- 异议处理(激活"冷启动"候选人和挽回拒绝者)

我们的合作流程:
1. 场景询问 - 了解您要挖什么层级的人才和公司背景
2. 策略分析 - 分析候选人核心诉求与心理防线
3. 话术输出 - 生成2-3个版本的邀约话术
4. 组合建议 - 附带发送时间建议及后续跟进策略

请告诉我:您目前最头疼的一个招聘场景或一段想要修改的邀约话术是什么?`,
      "1304": `您好!我是你的面试反馈表专家顾问,拥有50年企业招聘项目落地经验。

我能帮你:
- 设计科学专业的面试反馈表
- 建立清晰的评分标准体系
- 优化面试评估流程
- 提升招聘决策质量

我们的工作流程:
1. 首先了解你的岗位和招聘需求
2. 为你定制评估维度和标准
3. 输出可直接使用的反馈表模板
4. 根据你的反馈持续优化

现在,请告诉我:你希望为什么岗位设计面试反馈表?目前面试评估遇到了什么挑战?`,
      "1305": `您好!我是您的专业录用通知书撰写大师,拥有50年的落地项目经验,精通各行业录用通知书的撰写规范和法律要求。

我可以为您提供以下服务:
- 撰写专业录用通知书 - 为不同岗位定制合规、专业的录用通知
- 审核现有通知书 - 检查法律风险,优化表述内容
- 提供专业建议 - 解答录用通知相关的法律和实务问题
- 设计配套文档 - 劳动合同、保密协议等HR文书

我的工作流程:
1. 了解您的需求 - 询问企业信息、岗位详情、薪酬待遇等
2. 确认关键信息 - 二次确认重要条款,避免遗漏
3. 设计方案 - 提供多种表述方案供您选择
4. 撰写初稿 - 完整、规范的录用通知书
5. 优化完善 - 根据您的反馈调整优化
6. 交付成果 - 可直接使用的最终版本

现在,请告诉我您的具体需求:您是需要撰写新的录用通知书,还是审核现有通知书,或是咨询相关问题?`,
      "1306": `您好!我是企业新员工入职手册定制专家,拥有50年企业管理咨询与人力资源实战经验。

我能为您提供的服务:
- 文化传递 - 精准提炼企业文化,用有温度的语言传递价值观
- 效率提升 - 构建清晰的业务SOP和工具指引,缩短新人适应期
- 风险规避 - 明确红线与合规要求,保障企业与员工双方权益
- 体验优化 - 打造"保姆级"生活与工作指南,提升新员工满意度
- 结构化输出 - 生成一份目录清晰、内容详实、格式规范的Markdown格式入职手册

我们的工作流程:
1. 需求调研 - 询问您的企业行业、规模、核心痛点及希望传递的文化基调
2. 大纲确认 - 根据调研结果,提供一份入职手册的目录大纲供您确认
3. 分章节撰写 - 欢迎与文化、生存指南、业务作战图、成长与红线
4. 核查与交付 - 检查是否有遗漏信息,提醒您后续落地的注意事项

请告诉我:贵公司目前处于什么发展阶段?您希望这份手册的整体基调是严肃专业的,还是活泼扁平的?`,
      "1307": `您好!我是您的离职手续专业顾问,拥有50年人力资源管理和离职流程处理经验。

我的服务流程如下:
1. 了解您的情况 - 倾听您的需求和困惑
2. 制定专属方案 - 为您设计个性化离职计划
3. 准备必要文档 - 提供模板并指导填写
4. 执行流程指导 - 手把手教您完成每个环节
5. 保障合法权益 - 帮您核算和争取应得权益
6. 后续事务处理 - 协助解决离职后的各项事务

请告诉我您目前的情况:
- 您在什么类型的公司工作?(国企/私企/外企等)
- 您的岗位和工作年限是?
- 您离职的主要原因是什么?
- 您目前处于离职的哪个阶段?(考虑中/已提出/办理中)

让我们一起确保您的离职过程顺利、合规,并最大程度地维护您的权益!`,
      "1308": `您好!我是您的职业发展规划大师,拥有50年的实战经验,曾帮助数千位职场人士成功实现职业突破。

我的服务涵盖:职业现状诊断、个性化发展规划、技能提升方案、求职转型指导、长期发展咨询等全方位内容。

接下来,我会通过系统化流程与您深度交流:
- 首先了解您的基本情况和核心诉求
- 然后进行专业的职业诊断分析
- 接着与您共同设定清晰的职业目标
- 再为您设计可行的发展路径
- 最后制定具体的行动方案

请放心,我们的交流完全保密,您可以畅所欲言。请先告诉我:您目前的职业状态如何?遇到了什么具体的困惑或挑战?让我们一起开启您的职业发展新篇章!`,
      "1309": `您好!我是拥有50年经验的企业级员工培训记录与复盘专家。

请把你的培训录音转文字稿、会议笔记或杂乱的记录发给我,我将为你生成一份可以直接汇报或归档的专业培训纪要。

为了效果更佳,请先告诉我:
1. 本次培训的主题是什么?
2. 主要受众是谁(如:新员工、销售经理、技术人员)?
3. 你希望重点侧重于'流程规范'还是'思维提升'?

我将帮您精准萃取核心知识点、转化为行动指南、生成标准化培训纪要,并捕捉学员痛点评估培训效果。`
    };
    return welcomeMessages[templateId] || welcomeMessages["1301"];
  };

  // 初始化欢迎消息（所有团队管理子类型）
  useEffect(() => {
    const teamManagementTemplateIds = ["1301", "1302", "1303", "1304", "1305", "1306", "1307", "1308", "1309"];
    if (teamManagementTemplateIds.includes(templateId) && messages.length === 0) {
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
      case "1301": return "/api/team-management/recruitment-ad";
      case "1302": return "/api/team-management/job-description";
      case "1303": return "/api/team-management/interview-invitation";
      case "1304": return "/api/team-management/interview-feedback";
      case "1305": return "/api/team-management/offer-letter";
      case "1306": return "/api/team-management/onboarding-handbook";
      case "1307": return "/api/team-management/resignation-procedure";
      case "1308": return "/api/team-management/career-planning";
      case "1309": return "/api/team-management/training-record";
      default: return "/api/team-management/recruitment-ad";
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
          const conversationType = getTeamManagementTypeByTemplateId(activeTemplate.toString());
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

    // 所有团队管理子类型：重置消息列表为对应的欢迎消息
    const teamManagementTemplateIds = ["1301", "1302", "1303", "1304", "1305", "1306", "1307", "1308", "1309"];
    if (teamManagementTemplateIds.includes(templateId)) {
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
      {["1301", "1302", "1303", "1304", "1305", "1306", "1307", "1308", "1309"].includes(templateId) ? (
        /* 所有团队管理子类型：统一使用对话模式UI */
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
                            const conversationType = getTeamManagementTypeByTemplateId(activeTemplate.toString());
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
