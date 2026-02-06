"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Video,
  Loader2,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Save,
  X,
  Calendar,
  MessageSquare,
  Plus,
  Send,
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
import { videoContentTemplates } from "@/lib/video-templates";
import { MessageBubble } from "@/components/message-bubble";
import { supabase } from "@/lib/supabase";
import { cleanMarkdownClient } from "@/lib/markdown-cleaner-client";
import {
  createConversation,
  getConversations,
  addMessage,
  getVideoTypeByTemplateId,
  type Conversation as DBConversation,
} from "@/lib/conversations";

// 顶部筛选标签
const topFilters = [
  { id: "hot", label: "热门写作" },
  { id: "favorite", label: "收藏最多" },
  { id: "newest", label: "最新推出" },
  { id: "featured", label: "平台精选" },
];

// 视频类型选项
const videoTypes = [
  { value: "oral", label: "口播" },
  { value: "plot", label: "剧情" },
  { value: "vlog", label: "Vlog" },
  { value: "product", label: "带货" },
  { value: "tutorial", label: "教程" },
  { value: "entertainment", label: "娱乐" },
];

// 目标选项
const goalOptions = [
  { value: "fans", label: "涨粉" },
  { value: "monetization", label: "变现" },
  { value: "interaction", label: "互动" },
  { value: "brand", label: "品牌宣传" },
];

// 示例提问
const examplePrompts = [
  {
    id: 1,
    text: "我想拍一个美妆产品带货视频,目标观众是25-35岁职场女性,希望提高购买转化率。",
  },
  {
    id: 2,
    text: "需要一个职场干货类口播脚本,关于时间管理技巧,目标是涨粉和提高互动。",
  },
  {
    id: 3,
    text: "想做一个美食探店Vlog,突出餐厅特色和用餐体验,吸引本地吃货关注。",
  },
];

// 视频文案功能的AI欢迎消息
// 1001: 短视频脚本大纲
const VIDEO_SCRIPT_OUTLINE_WELCOME = `你好！我是你的全能爆款短视频脚本大师。 🎬
我不止写文字，我为你设计画面、节奏和情绪。

为了帮你写出**最精准、最具爆款潜质**的脚本，请先告诉我以下信息：
1.  **赛道领域**：(你是做什么的？)
2.  **账号人设**：(你的风格是专业、幽默还是治愈？)
3.  **本期选题**：(这期视频想讲什么？)
4.  **视频类型**：(口播、剧情、Vlog还是带货？)
5.  **目标受众**：(拍给谁看？)

你只需回复上述问题的答案，剩下的交给我！✨`;

// 1002: 短视频爆款文案
const VIDEO_VIRAL_COPY_WELCOME = `你好！我是拥有20年经验的**爆款短视频文案大师**。我不写废话，只产出能留住注意力的爆款。
在这个名利场，前3秒定生死，结尾定转化。

请告诉我：
1. 你想拍什么主题？（如：美妆带货、职场干货、情感故事...）
2. 你的目标观众是谁？
3. 你希望观众看完后做什么？（点赞、购买、还是去评论区吵架？）

把这些告诉我，我来为你定制专属的爆款脚本！`;

// 1003: 短视频爆款标题
const VIDEO_VIRAL_TITLE_WELCOME = `你好，我是拥有20年实战经验的短视频爆款标题大师。别让你的好内容死在标题上！不管是抖音、小红书还是视频号，我都能帮你抓住用户的眼球。

为了帮你打造最炸裂的标题，请告诉我以下信息：
1. 你的视频主要讲什么？（核心亮点）
2. 你的目标观众是谁？
3. 你准备发在哪个平台？
4. 如果有原标题，也请发给我诊断。`;

// 1004: 短视频分镜头脚本
const VIDEO_STORYBOARD_WELCOME = `你好!我是你的短视频分镜头脚本专家顾问,拥有20年行业实战经验。我专注于帮助创作者将创意想法转化为可执行的专业脚本,无论你是想打造爆款内容、推广品牌产品,还是记录生活点滴,我都能为你提供系统化的脚本设计方案。

**我的工作流程是这样的:**
1. 先深入了解你的具体需求(视频类型、平台、时长、目标等)
2. 为你提供专业的策划建议和创意方向
3. 创作详细的分镜头脚本,精确到每个镜头的画面和时长
4. 根据你的反馈不断优化调整
5. 提供实用的拍摄和执行指导

现在,请告诉我:**你想做什么类型的短视频?准备发布在哪个平台?大概多长时间?有什么具体的主题或想法吗?** 让我们一起打造出色的短视频内容! 🎬`;

// 1005: 短视频黄金3秒开头
const VIDEO_GOLDEN_3SEC_WELCOME = `👋 你好！我是你的短视频黄金3秒开头大师！

我拥有20年的短视频创作实战经验，专门帮助创作者打造能在3秒内抓住观众眼球的爆款开头，提升完播率和转化效果。

🎯 **我可以帮你**：
- 为你的视频量身定制高吸引力的开头脚本
- 提供多种经过验证的钩子策略和创意方案
- 诊断现有视频开头问题并给出改进建议
- 根据不同平台和内容类型优化开头设计

💡 **我的工作流程**：
1. 先了解你的视频主题、目标受众和发布平台
2. 为你设计3-5个不同风格的开头方案
3. 根据你的反馈持续优化调整
4. 提供A/B测试建议帮你找到最优方案

现在，请告诉我：
- 你的视频主题或产品是什么？
- 你的目标受众是谁？
- 准备在哪个平台发布？
- 视频类型是什么（带货/教学/娱乐/其他）？

让我们一起打造能让观众"停不下来"的黄金3秒开头！🚀`;

// 1006: 短视频带货口播文案
const VIDEO_SALES_SCRIPT_WELCOME = `👋 你好!我是短视频带货口播文案大师,拥有20年实战经验,已帮助上千个品牌打造爆款带货视频。

**我能为你做什么:**
- ✍️ 创作高转化率的短视频口播文案
- 🎯 提供专业的文案策略和优化建议
- 📊 传授爆款文案的底层逻辑和方法论
- 🔄 基于数据反馈持续迭代优化

**我的工作流程:**
1. 深入了解你的产品信息和目标人群
2. 制定专属的文案创作策略
3. 输出2-3版不同风格的口播文案
4. 提供执行建议和A/B测试方案
5. 根据数据反馈持续优化

现在,请告诉我:
- 你要推广什么产品?
- 目标用户是谁?
- 准备在哪个平台发布?

让我们一起打造爆款带货视频吧!🚀`;

// 1007: 短视频软广脚本
const VIDEO_SOFT_AD_WELCOME = `你好，我是你的短视频软广脚本大师。把流量变成GMV，是我唯一的KPI。

请告诉我：
1. 您要卖什么产品？
2. 您的目标客户是谁？
3. 您的产品最大的一个优势（卖点）是什么？`;

// 1008: 短视频卖点脚本
const VIDEO_SELLING_POINT_WELCOME = `你好！我是拥有20年实战经验的短视频营销专家，深谙"流量变现"的底层逻辑。擅长通过"外科手术式"的卖点提炼和"导演级"的分镜设计，将路人转化为下单客户。我不写无用的文字，只造赚钱的脚本。

请告诉我你想推销的产品信息，以便我开始为您设计爆款脚本：
1. 📦 **推销什么？** (产品/服务的名称、核心功能、优势参数)
2. 👥 **卖给谁？** (目标受众的画像：宝妈、学生、老板？以及他们的核心痛点)
3. 🎯 **核心目的？** (直接带货成交、品牌种草曝光、还是引流私域？)
4. 📹 **期望风格？** (激情口播、生活化Vlog、剧情段子、还是高端大片？)`;

// 1009: 短视频硬广脚本
const VIDEO_HARD_AD_WELCOME = `你好，我是你的短视频硬广脚本大师。把流量变成GMV，是我唯一的KPI。

请告诉我：
1. 您要卖什么产品？
2. 您的目标客户是谁？
3. 您的产品最大的一个优势（卖点）是什么？`;

// 1010: 短视频钩子脚本
const VIDEO_HOOK_SCRIPT_WELCOME = `👋 你好!我是**短视频钩子脚本大师**,拥有20年短视频创作实战经验。

我深知在这个注意力稀缺的时代,**前3秒决定生死**。无数好内容因为开头平淡而被划走,我的使命就是帮你打造让人"停不下来"的爆款脚本!

💡 **我能为你做什么?**
- 🎯 创作高吸引力的开头钩子,让完播率翻倍
- 📝 构建完整短视频脚本框架,优化叙事节奏
- 🔥 拆解爆款案例,提炼可复制的成功公式
- 🛠️ 诊断优化现有脚本,提升流量推荐
- 🎭 适配抖音/快手/小红书等多平台特性

📋 **接下来的工作流程:**
1. 我会先了解你的视频主题、目标受众和平台定位
2. 然后为你制定最适合的钩子策略和叙事结构
3. 创作完整脚本并提供拍摄执行建议
4. 根据你的反馈优化迭代,直到满意为止
5. 发布后可以一起复盘数据,持续提升

现在,请告诉我:**你想创作什么主题的短视频?目标受众是谁?准备发布在哪个平台?** 让我们一起打造你的爆款脚本! 🚀`;

// 1011: 短视频抛问题法
const VIDEO_QUESTION_METHOD_WELCOME = `👋 你好!我是你的短视频抛问题法专业顾问,拥有20年短视频内容策划经验。

我专注于帮助创作者设计能瞬间抓住用户注意力的问题钩子,通过精准的提问让你的视频完播率翻倍、互动量暴增。无论你是刚入门的新手,还是想要突破瓶颈的成熟创作者,我都能为你提供实战性极强的解决方案。

**我的工作流程是这样的**：首先我会了解你的内容领域和目标受众,然后为你设计3-5个可直接使用的问题钩子,每个问题我都会解释它触发的用户心理。如果你有现成的脚本,我会帮你优化问题布局；如果你想学习爆款案例,我会拆解给你看。整个过程中我会根据你的反馈不断调整,直到找到最适合你的问题风格。

现在,请告诉我：你目前在做什么类型的短视频内容？遇到了什么具体困扰？或者你可以直接发一个你的视频脚本给我,我帮你诊断优化！`;

// 1012: 短视频技巧放大法
const VIDEO_TECHNIQUE_AMPLIFY_WELCOME = `你好!我是短视频技巧放大法大师,拥有20年的短视频实战经验。我精通各大平台的算法机制、爆款内容创作方法、流量运营策略和商业变现路径。无论你是刚起步的新手创作者,还是遇到瓶颈的成熟账号,我都能为你提供从内容策划、拍摄制作到流量变现的全链路专业指导。

我的工作流程是这样的:首先我会深入了解你的账号现状、目标和资源条件,然后为你诊断核心问题,接着提供可落地的解决方案和具体操作步骤,最后根据你的反馈进行深度指导和持续优化建议。

现在,请告诉我:
- 你目前在做什么类型的短视频内容?
- 你遇到的最大困扰是什么?(比如没流量、完播率低、不知道拍什么、想变现等)
- 你希望在短视频创作上达到什么目标?

让我们开始打造你的短视频爆款之路吧!`;

// 1013: 短视频数据佐证法
const VIDEO_DATA_PROOF_WELCOME = `你好，我是短视频数据佐证法大师。在这里，我们不谈玄学，只谈数据。我的工作是透过后台数据，像法医一样解剖你的视频，找出流量停滞的真凶。

请告诉我你目前遇到的核心问题（如：播放量卡500、完播率低、投放亏损等），并尽可能提供你的**完播率、5秒完播率、平均播放时长或互动数据**。

请出示你的'呈堂证供'，我们开始吧。`;

// 1014: 短视频指出错误法
const VIDEO_ERROR_POINT_WELCOME = `你好!我是你的短视频内容诊断专家,拥有20年实战经验,专注于帮助创作者精准识别视频问题并突破流量瓶颈。

🔍 **我擅长的领域包括**:
- 黄金3秒开头诊断与优化
- 叙事结构与节奏把控分析
- 各平台算法适配性评估
- 数据反推内容问题诊断
- 视听语言专业性点评

📋 **我的工作流程**:
1. 先了解你的内容类型、目标平台和具体需求
2. 系统性诊断视频在各维度的问题
3. 按优先级输出问题清单+可执行的优化方案
4. 根据你的反馈深度展开或调整建议

现在,请告诉我:
- 你需要我分析什么内容?(脚本/视频链接/截图/数据等)
- 目标发布平台是哪个?(抖音/快手/视频号/小红书等)
- 你当前最困惑的问题是什么?

让我们开始为你的短视频"把脉问诊"吧! 🎬`;

// 1015: 短视频列举法
const VIDEO_LIST_METHOD_WELCOME = `你好，我是拥有20年经验的短视频列举法大师。融合了电视广告的精准打击与互联网短视频的碎片化叙事逻辑。专精于"列举法"（Listicle）结构，深知如何利用信息极简架构和注意力心理学，将普通内容转化为高完播、高转化的爆款短视频。

请告诉我**你所在的行业**以及**你想拍摄的主题**，我将为你通过'列举法'打造3个爆款选题方案。`;

export function VideoWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "短视频爆款文案";
  const templateId = searchParams.get("template") || "1001";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  const [activeFilter, setActiveFilter] = useState("hot");
  const [activeTemplate, setActiveTemplate] = useState(parseInt(templateId));
  const [contentInput, setContentInput] = useState("");
  const [videoType, setVideoType] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [searchQuery, setSearchQuery] = useState("");

  // 新增状态
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // 对话模式状态
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

  // 对话历史状态
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  // 获取当前模板对应的欢迎消息
  const getWelcomeMessage = (templateId: string): string => {
    switch (templateId) {
      case "1001": return VIDEO_SCRIPT_OUTLINE_WELCOME;
      case "1002": return VIDEO_VIRAL_COPY_WELCOME;
      case "1003": return VIDEO_VIRAL_TITLE_WELCOME;
      case "1004": return VIDEO_STORYBOARD_WELCOME;
      case "1005": return VIDEO_GOLDEN_3SEC_WELCOME;
      case "1006": return VIDEO_SALES_SCRIPT_WELCOME;
      case "1007": return VIDEO_SOFT_AD_WELCOME;
      case "1008": return VIDEO_SELLING_POINT_WELCOME;
      case "1009": return VIDEO_HARD_AD_WELCOME;
      case "1010": return VIDEO_HOOK_SCRIPT_WELCOME;
      case "1011": return VIDEO_QUESTION_METHOD_WELCOME;
      case "1012": return VIDEO_TECHNIQUE_AMPLIFY_WELCOME;
      case "1013": return VIDEO_DATA_PROOF_WELCOME;
      case "1014": return VIDEO_ERROR_POINT_WELCOME;
      case "1015": return VIDEO_LIST_METHOD_WELCOME;
      default: return VIDEO_VIRAL_COPY_WELCOME;
    }
  };

  // 获取当前模板对应的API端点
  const getApiEndpoint = (templateId: string): string => {
    switch (templateId) {
      case "1001": return "/api/video-script-outline";
      case "1002": return "/api/video-viral-copy";
      case "1003": return "/api/video-viral-title";
      case "1004": return "/api/video-storyboard";
      case "1005": return "/api/video-golden-3sec";
      case "1006": return "/api/video-sales-script";
      case "1007": return "/api/video-soft-ad";
      case "1008": return "/api/video-selling-point";
      case "1009": return "/api/video-hard-ad";
      case "1010": return "/api/video-hook-script";
      case "1011": return "/api/video-question-method";
      case "1012": return "/api/video-technique-amplify";
      case "1013": return "/api/video-data-proof";
      case "1014": return "/api/video-error-point";
      case "1015": return "/api/video-list-method";
      default: return "/api/video";
    }
  };

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
        const conversationType = getVideoTypeByTemplateId(activeTemplate);
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

  // 初始化欢迎消息（视频文案功能）
  useEffect(() => {
    const videoTemplateIds = ["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010", "1011", "1012", "1013", "1014", "1015"];
    if (videoTemplateIds.includes(templateId) && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: getWelcomeMessage(templateId),
        isCollapsed: false
      }]);
    }
  }, [templateId]);

  const handleExampleClick = (text: string) => {
    setContentInput(text);
  };

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
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/___(.+?)___/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/!\[.*?\]\(.+?\)/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^>\s+/gm, '')
      .replace(/^[\*\-\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/^[\-\*_]{3,}$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // 输入框高度自适应
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);

    const target = e.target;
    target.style.height = '60px';

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

  // 发送消息（视频文案功能）
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
          const conversationType = getVideoTypeByTemplateId(activeTemplate);
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

  // 新建对话（视频文案功能）
  const handleNewConversation = () => {
    setConversationHistory([]);
    setCurrentResult("");
    setError("");
    setCurrentConversationId(null);
    setInputValue("");

    // 重置消息列表为欢迎消息
    const videoTemplateIds = ["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010", "1011", "1012", "1013", "1014", "1015"];
    if (videoTemplateIds.includes(templateId)) {
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: getWelcomeMessage(templateId),
        isCollapsed: false
      }]);
      setInputHeight(60);
      if (inputRef.current) {
        inputRef.current.style.height = '60px';
      }
    }
  };

  // 智能创作
  const handleSubmit = async () => {
    if (!contentInput.trim()) {
      setError("请输入视频主题或内容描述");
      return;
    }

    setIsLoading(true);
    setError("");
    setCurrentResult("");
    setResultTab("current");

    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentInput,
          videoType: videoType,
          audience: audience,
          goal: goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setCurrentResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创作失败,请重试");
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

  // 根据source参数判断返回路径
  const getBackPath = () => {
    if (source === "hot") {
      // 从热门写作来的，返回首页
      return "/";
    } else if (source.startsWith("media-") || source.startsWith("video-")) {
      // 从分类来的，返回自媒体分类页
      return "/?category=media";
    } else {
      // 默认返回首页
      return "/";
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {["1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008", "1009", "1010", "1011", "1012", "1013", "1014", "1015"].includes(templateId) ? (
        /* 视频文案功能：统一使用对话模式UI */
        <div className="w-full flex flex-col">
          {/* 统一的顶部标题栏 */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              {/* 左侧：返回 + 标题 */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(getBackPath())}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">返回</span>
                </button>
                <h1 className="text-lg font-semibold text-foreground">
                  {templateTitle}
                </h1>
              </div>

              {/* 中间：新建对话 + 历史记录 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewConversation}
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
      {/* Left Sidebar - Template List */}
      <div className="w-[280px] border-r border-border bg-card flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => router.push(getBackPath())}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回分类页</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="请输入关键词搜索"
              className="pl-9 h-9 bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-2">
          {videoContentTemplates
            .filter((template) =>
              template.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  // 立即更新activeTemplate状态
                  setActiveTemplate(template.id);
                  // 然后更新URL
                  router.push(
                    `/writing/video?template=${template.id}&title=${encodeURIComponent(template.title)}&source=${source}`
                  );
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all mb-1",
                  activeTemplate === template.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl",
                    template.color
                  )}
                >
                  {template.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "font-medium text-sm truncate",
                      activeTemplate === template.id
                        ? "text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {template.title}
                  </h3>
                  <p
                    className={cn(
                      "text-xs truncate mt-0.5",
                      activeTemplate === template.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {template.desc}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Center - Form Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Filter Tabs */}
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-2">
            {topFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="h-8"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              {templateTitle}
            </h1>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => handleExampleClick(examplePrompts[0].text)}
            >
              插入示例
            </Button>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              欢迎来到{templateTitle}
              创作空间！我不写废话,只产出能留住注意力的爆款。前3秒定生死,结尾定转化。请告诉我您的视频主题、目标观众和核心目标,让我们开始创作吧！
            </p>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              您可以试试这样提问:
            </p>
            <div className="space-y-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleExampleClick(prompt.text)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group w-full text-left"
                >
                  <span className="flex-1">{prompt.text}</span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                视频主题
              </label>
              <Textarea
                placeholder="请输入您想要创作的视频主题或内容描述..."
                className="min-h-[120px] resize-none"
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
              />
            </div>

            {/* Video Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                视频类型 (可选)
              </label>
              <Select value={videoType} onValueChange={setVideoType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择视频类型" />
                </SelectTrigger>
                <SelectContent>
                  {videoTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                目标观众 (可选)
              </label>
              <Input
                placeholder="例如: 25-35岁职场女性"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            {/* Goal */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                核心目标 (可选)
              </label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择核心目标" />
                </SelectTrigger>
                <SelectContent>
                  {goalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
      <div className="w-[400px] border-l border-border bg-card flex flex-col relative">
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
                  AI正在为您创作爆款视频脚本...
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
                        if (navigator.share) {
                          navigator.share({
                            title: "短视频爆款文案",
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
                  AI创作结果会在显示这里,现在你只需要
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>1. 在左侧填好必要的信息,填写越详细,结果越准确哦</p>
                  <p>2. 点击智能创作按钮,静待AI妙笔生花,一般在10秒内搞定</p>
                </div>
              </div>
            )
          ) : (
            // 历史创作结果
            <ScrollArea className="h-full">
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  暂无历史创作记录
                </p>
              </div>
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
