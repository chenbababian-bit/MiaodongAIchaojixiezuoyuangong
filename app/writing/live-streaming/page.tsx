"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Calendar,
  Loader2,
  Copy,
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
  type LiveStreamingType,
  getLiveStreamingTypeByTemplateId,
} from "@/lib/conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";

// 直播话术13个子类型的AI欢迎消息
// 6001: 直播产品卖点话术
const LIVE_PRODUCT_SELLING_WELCOME = `您好!我是您的专属直播话术策划大师,拥有20年直播电商实战经验。

我能帮您:
- 撰写高转化的完整直播话术脚本
- 提炼产品核心卖点并转化为大白话
- 设计不同场景的差异化话术策略
- 预判消费者疑虑并提供应对方案
- 基于数据优化话术结构提升转化率

接下来请告诉我:
1. 您的产品是什么?(类别、名称、主要功能)
2. 产品价格区间?目标人群是谁?
3. 这次直播的主要目标?(引流/冲销量/清库存/打造爆款)
4. 有没有特殊的促销活动或卖点?

提供的信息越详细,我为您定制的话术就越精准、越有杀伤力!让我们一起打造爆款直播间吧。`;

// 6002: 直播成交话术
const LIVE_CLOSING_WELCOME = `你好,老铁!我是你的直播成交话术架构师!

我拥有20年实战带货经验,专门帮助直播主播打造高转化的成交话术体系。

我能为你做什么:
- 搭建完整的直播间话术框架(开场-互动-逼单-异议处理)
- 提供高转化率的成交话术设计
- 解决直播实战中的具体问题
- 策划科学的直播流程脚本
- 提供话术使用培训指导

现在,请告诉我:
- 你卖什么产品?
- 对标谁?
- 最大的痛点是没人看还是没人买?

让我们一起打造你的高转化直播间!`;

// 6003: 直播基础品话术
const LIVE_BASIC_PRODUCT_WELCOME = `你好！我是你的专业直播基础品话术顾问，深耕基础品直播领域50年，专注于帮助主播打造高转化、快节奏的基础品话术体系。

我在基础品直播领域的专长:
- 纸品、清洁、粮油、调味、日化等全品类话术设计
- 性价比塑造与价格对比呈现技巧
- 快节奏翻品与高频促单话术策略
- 组合套餐与连带销售话术设计
- 限时限量与紧迫感营造方法
- 复购引导与会员转化话术

请告诉我：你目前在卖什么基础品？遇到了什么话术难题？（比如：转化率低、客单价上不去、观众停留时间短等）

我会为你量身定制专业的基础品直播话术解决方案！`;

// 6004: 直播互动话术
const LIVE_INTERACTION_WELCOME = `你好!我是直播互动话术大师,拥有50年直播行业实战经验,专注于帮助主播提升直播话术和互动能力。

我能为你做什么:
- 设计高转化率的直播话术脚本(开场/产品介绍/促单/留人)
- 提供各种场景的互动应对技巧(冷场/黑粉/质疑/卡顿)
- 定制个性化话术模板库
- 优化直播流程和节奏设计
- 解决你在实战中遇到的具体问题

现在,请告诉我:
- 你目前在做什么类型的直播?(带货/知识分享/娱乐等)
- 你主要销售什么产品或提供什么内容?
- 你目前最想解决的直播问题是什么?

让我们开始打造你的专属直播话术吧!`;

// 6005: 直播停留话术
const LIVE_RETENTION_WELCOME = `你好！我是你的专属直播停留话术大师，拥有50年的实战经验，已帮助数千位主播打造高转化直播间。

我能为你做什么:
- 设计完整的直播话术体系(开场-互动-促单-收尾)
- 提升观众停留率和互动率的实战技巧
- 针对你的产品和人群定制专属话术
- 诊断现有直播问题并提供解决方案
- 优化你的表达方式，提升感染力和转化力

现在，请告诉我：
1. 你目前做什么类型的直播？(带货/知识分享/娱乐等)
2. 主要销售什么产品或提供什么服务？
3. 你现在遇到的最大困扰是什么？

让我们开始打造你的高转化直播话术体系吧！`;

// 6006: 直播组合品话术
const LIVE_COMBO_PRODUCT_WELCOME = `你好！我是一位在直播带货领域深耕"50年"的骨灰级专家。我深知"单品拼价格，组合品拼价值"的铁律。

我的专长:
- 诊断品类关系，精准匹配最适合的组合模型
- 构建"价值塑造-层层加码-价格重构-逼单成交"的完整话术
- 解析成交逻辑，教会你为什么这么卖

请告诉我以下三项关键信息:
1. 你的核心主推品是什么？
2. 你手里的搭配品/赠品/库存品有什么？
3. 这一场的战略目标是什么？（是保利润？还是冲销量清库存？）

只要你给我这三个信息，我立刻为你生成一套价值连城的、包含'开场+痛点+加码+逼单'的完整组合品话术！`;

// 6007: 直播福利品话术
const LIVE_WELFARE_PRODUCT_WELCOME = `欢迎来到福利品话术特训营!

我是您的专属直播福利品话术大师,拥有50年行业经验的专业沉淀!我专门帮助主播打造高转化、强氛围、真诚可信的福利品销售话术。

我的专长:
- 设计爆款福利品介绍话术,瞬间抓住观众注意力
- 营造直播间抢购氛围,激发购买欲望
- 提供真实有效的价值对比和促单技巧
- 快速建立信任,化解观众疑虑
- 确保所有话术合法合规,长期可持续

现在,让我们开始吧!请告诉我:
1. 您要推广什么类型的福利品?(如服装、食品、家居用品等)
2. 这个福利品的主要优势是什么?(价格、品质、品牌等)
3. 您的目标观众是谁?(年龄、性别、消费习惯)
4. 您目前在福利品销售中遇到的最大挑战是什么?

让我为您量身定制爆单话术方案!`;

// 6008: 直播催单话术
const LIVE_URGENCY_WELCOME = `你好！我是直播带货界的"鬼谷子"，拥有50年销售心理学与实战经验。

我能帮你:
- 打造从起手聚人、承接留人到高潮开价的完整高转化单品循环脚本
- 运用限时限量、价格脱敏、从众效应等心理战术，提供临门一脚的逼单话术
- 针对嫌贵、不信质量、比价等刁钻问题，提供转危为机的机智回复
- 指导如何通过语调、互动来控制直播间的能量场

现在,请告诉我:
- 你现在主要卖什么产品?
- 或者你遇到了什么具体的直播难题(比如留不住人、甚至没人互动)?

让我们一起打造爆款直播间吧。`;

// 6009: 直播下播话术
const LIVE_ENDING_WELCOME = `您好！我是您的专业直播下播话术顾问，拥有50年行业经验沉淀的话术设计能力。

我能帮您解决:
- 下播时观众流失严重，留不住人
- 不知道如何自然地预告下次直播
- 缺乏有效的粉丝转化话术
- 不同直播效果不知如何应对
- 下播环节缺乏专业性和仪式感

现在，请告诉我：
- 您主要做什么类型的直播？（带货/娱乐/知识分享/其他）
- 您在下播环节遇到的最大困扰是什么？

让我们一起打造完美的直播收尾，让每一次下播都成为下一次爆场的开始！`;

// 6010: 30分钟直播话术
const LIVE_30MIN_SCRIPT_WELCOME = `你好！我是50年经验直播转化率（CVR）操盘手。

我的专长:
- 打造30分钟闭环脚本：[0-3引入]-[3-10痛点]-[10-20产品]-[20-25逼单]-[25-30预告]
- 提供完整的话术、动作、道具、镜头指导
- 运用算法喂养术、五感描述法、价格魔术等技巧

现在,请告诉我:
1. 产品名称
2. 价格/赠品机制
3. 你最想解决的直播难题

给我一个产品，我能帮你把直播间卖空！`;

// 6011: 直播带货脚本
const LIVE_SALES_SCRIPT_WELCOME = `您好！我是直播带货脚本大师，拥有50年的直播带货经验。

我擅长:
- 为各类产品创作高转化率的直播脚本
- 设计吸引人的互动玩法和促销策略
- 优化产品卖点和逼单话术
- 提供直播流程策划和实战指导

请告诉我：
- 您要带货的产品是什么？
- 目标人群是谁？
- 直播时长大概多久？
- 有什么特殊要求吗？

让我们一起打造一场爆款直播！`;

// 6012: 主播成长规划
const LIVE_HOST_GROWTH_WELCOME = `你好！我是你的全案级主播成长规划大师，拥有50年从业经验。

我能为你做什么:
- 精准定位：挖掘核心人格，确立差异化竞争优势
- 打磨基本功：提升镜头表现力、话术逻辑、控场能力
- 流量获取：指导脚本工业化生产，解析算法逻辑
- 商业变现：规划全链路变现策略
- 心态风控：提供心理建设支持，制定危机公关SOP

请回答以下三个问题:
1. 现状：你现在是纯素人（0粉丝），还是已经开始播了但遇到了瓶颈？
2. 资源：你每天能投入多少小时？你有多少预算？
3. 目标：你到底是想赚快钱，还是想做品牌？

回答完这三个问题，我们就可以开始第一课！`;

// 6013: 直播间标题生成器
const LIVE_TITLE_GENERATOR_WELCOME = `你好！我是50年经验的直播间标题生成大师。

我的专长:
- 极大提升点击率(CTR)：通过心理学钩子提高直播间点击率
- 精准人群筛选：吸引精准的目标受众
- 规避风控风险：确保标题符合广告法及平台规则
- 强化搜索权重(SEO)：增加直播间被搜索到的概率
- 场景化定制：针对带货、娱乐、知识付费等不同场景

请按以下格式提供信息:
1. 你的赛道/类目
2. 你的目标受众
3. 核心卖点/内容
4. 你想要的风格

让我们一起打造流量爆款标题！`;

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  switch (templateId) {
    case "6001": return LIVE_PRODUCT_SELLING_WELCOME;
    case "6002": return LIVE_CLOSING_WELCOME;
    case "6003": return LIVE_BASIC_PRODUCT_WELCOME;
    case "6004": return LIVE_INTERACTION_WELCOME;
    case "6005": return LIVE_RETENTION_WELCOME;
    case "6006": return LIVE_COMBO_PRODUCT_WELCOME;
    case "6007": return LIVE_WELFARE_PRODUCT_WELCOME;
    case "6008": return LIVE_URGENCY_WELCOME;
    case "6009": return LIVE_ENDING_WELCOME;
    case "6010": return LIVE_30MIN_SCRIPT_WELCOME;
    case "6011": return LIVE_SALES_SCRIPT_WELCOME;
    case "6012": return LIVE_HOST_GROWTH_WELCOME;
    case "6013": return LIVE_TITLE_GENERATOR_WELCOME;
    default: return LIVE_PRODUCT_SELLING_WELCOME;
  }
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "6001": return "/api/live-product-selling";
    case "6002": return "/api/live-closing";
    case "6003": return "/api/live-basic-product";
    case "6004": return "/api/live-interaction";
    case "6005": return "/api/live-retention";
    case "6006": return "/api/live-combo-product";
    case "6007": return "/api/live-welfare-product";
    case "6008": return "/api/live-urgency";
    case "6009": return "/api/live-ending";
    case "6010": return "/api/live-30min-script";
    case "6011": return "/api/live-sales-script";
    case "6012": return "/api/live-host-growth";
    case "6013": return "/api/live-title-generator";
    default: return "/api/live-product-selling";
  }
};

function LiveStreamingWritingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "直播产品卖点话术";
  const templateId = searchParams.get("template") || "6001";
  const source = searchParams.get("source") || "media-live";

  // 状态管理
  const [activeTemplate, setActiveTemplate] = useState(parseInt(templateId));
  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // 统一的对话框状态
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
        const conversationType = getLiveStreamingTypeByTemplateId(activeTemplate);
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

  // 初始化欢迎消息
  useEffect(() => {
    const liveTemplateIds = ["6001", "6002", "6003", "6004", "6005", "6006", "6007", "6008", "6009", "6010", "6011", "6012", "6013"];
    if (liveTemplateIds.includes(templateId) && messages.length === 0) {
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

  // 发送消息
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
          const conversationType = getLiveStreamingTypeByTemplateId(activeTemplate);
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

  // 新建对话
  const handleNewConversation = () => {
    setConversationHistory([]);
    setCurrentResult("");
    setError("");
    setCurrentConversationId(null);
    setInputValue("");

    const liveTemplateIds = ["6001", "6002", "6003", "6004", "6005", "6006", "6007", "6008", "6009", "6010", "6011", "6012", "6013"];
    if (liveTemplateIds.includes(templateId)) {
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

  // 返回路径
  const getBackPath = () => {
    return "/?category=media";
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* 直播话术模块：统一使用对话模式UI */}
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
                  提示：Enter发送，Shift+Enter换行
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
    </div>
  );
}

export default function LiveStreamingWritingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LiveStreamingWritingPageContent />
    </Suspense>
  );
}
