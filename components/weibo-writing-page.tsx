"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import {
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
  getWeiboTypeByTemplateId,
  type Conversation as DBConversation,
} from "@/lib/conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import { getTemplateById, getCanonicalId } from "@/lib/template-config";
import { useCredits } from "@/lib/credits-context";

// 微博7个子功能的示例提问
const examplePromptsByTemplate: Record<string, string[]> = {
  // 401: 微博短推文
  "401": [
    "我想分享一个关于时间管理的小技巧，帮助职场人提高工作效率",
    "我发现了一个超好用的生活小妙招，想用微博的形式分享给大家",
    "我想发一条关于读书感悟的微博，主题是《活着》这本书给我的启发"
  ],
  // 402: 微博长文
  "402": [
    "我想写一篇关于职场成长的微博长文，分享我从新人到管理者的心路历程",
    "我想分享一篇关于健康饮食的深度文章，帮助大家建立科学的饮食观念",
    "我想写一篇旅行游记，记录我在西藏的难忘经历和感悟"
  ],
  // 403: 微博爆款标题
  "403": [
    "我写了一篇关于副业赚钱的微博长文，内容包括10种靠谱的副业方式，帮我设计吸引人的标题",
    "我的微博是分享减肥经验，主要讲如何在3个月内健康瘦20斤，需要一个高点击率的标题",
    "我整理了一份职场避坑指南，包含新人最容易犯的10个错误，想要一个能引发共鸣的标题"
  ],
  // 404: 微博账号名称
  "404": [
    "我是一名美食博主，主要分享家常菜做法和探店经验，帮我设计一个好记的微博账号名称",
    "我想做职场干货分享，目标受众是职场新人，需要一个专业又亲切的账号名称",
    "我是健身教练，想在微博上分享健身知识和训练计划，帮我想一个有特色的账号名"
  ],
  // 405: 微博热点分析
  "405": [
    "最近#年轻人为什么不愿意加班#这个话题很火，帮我分析一下这个热点背后的社会现象",
    "我想蹭#AI人工智能#这个热点，从教育行业的角度切入，帮我分析如何借势",
    "#露营经济#最近很热，我是户外用品商家，帮我分析如何利用这个热点做营销"
  ],
  // 406: 微博账号简介
  "406": [
    "我是一名心理咨询师，主要分享情绪管理和心理健康知识，帮我写一个专业又温暖的账号简介",
    "我是数码博主，专注于手机和电脑评测，想要一个能体现专业性的账号简介",
    "我是旅行摄影师，分享世界各地的美景和旅行攻略，需要一个有格调的账号简介"
  ],
  // 407: 微博推文
  "407": [
    "我想发一条关于新产品上市的微博，产品是智能手表，目标受众是年轻人",
    "我想分享一个职场小故事，主题是如何应对职场PUA，希望能引发共鸣",
    "我想发一条美食推荐微博，介绍我家附近新开的一家日料店"
  ],
  // 默认示例
  "default": [
    "我想创作一条微博内容，主题是...",
    "我需要一个吸引人的微博标题，内容是关于...",
    "我想分析一个微博热点话题..."
  ]
};

// 微博7个子功能的欢迎消息
// 401: 微博短推文
const WEIBO_SHORT_WELCOME = `你好！我是你的微博短推文创作专家。

我的专长：
- 精准把握微博短内容的节奏和调性
- 用简洁有力的文字传达核心信息
- 设计引发互动的话题和金句
- 结合热点和用户心理提升传播力

我的工作流程：
1. 了解你想表达的主题和核心观点
2. 分析目标受众和传播目的
3. 生成3-5个不同风格的短推文方案
4. 根据你的反馈进行优化调整
5. 提供配图建议和发布策略

请告诉我：
- 你想发布什么主题的短推文？
- 你的目标受众是谁？
- 你希望达到什么效果？（涨粉/互动/传播观点等）`;

// 402: 微博长文
const WEIBO_LONG_WELCOME = `你好！我是你的微博长文创作专家。

我的专长：
- 深度内容的结构化呈现
- 故事化叙事与观点输出
- 情感共鸣与价值传递
- 长文的节奏把控和可读性优化

我的工作流程：
1. 了解你的创作主题和核心观点
2. 确定文章的叙事角度和结构
3. 生成详细的文章大纲
4. 撰写完整的长文内容
5. 根据反馈进行优化调整

请告诉我：
- 你想写什么主题的长文？
- 你想传达什么核心观点或价值？
- 你的目标读者是谁？`;

// 403: 微博爆款标题
const WEIBO_TITLE_WELCOME = `你好！我是你的微博爆款标题专家，拥有20年新媒体标题创作实战经验。

我深知一个好标题的价值——它能让你的优质内容获得10倍、甚至100倍的传播力！我擅长洞察用户心理，精通各大平台算法机制，能为你的内容量身打造具有强大吸引力的爆款标题。

我可以帮你：
✅ 创作5-10个不同风格的爆款标题方案
✅ 精准把握用户痛点和情绪触发点
✅ 提升内容打开率和传播效果
✅ 传授标题创作的底层逻辑和技巧

接下来请告诉我：
1. 你的内容主题是什么？
2. 核心观点或价值点是什么？
3. 目标受众是谁？
4. 内容类型是？（干货教程/观点评论/故事分享/资讯报道等）

让我们一起创作出让人忍不住点击的爆款标题吧！`;

// 404: 微博账号名称
const WEIBO_NAME_WELCOME = `你好！我是你的微博账号名称策划专家。

我的专长：
- 品牌定位与账号人设设计
- 易记易传播的命名策略
- 符合平台规则的名称优化
- 差异化竞争的名称创意

我的工作流程：
1. 了解你的账号定位和内容方向
2. 分析目标受众和竞品情况
3. 生成5-10个不同风格的名称方案
4. 提供每个名称的寓意解释
5. 根据反馈进行优化调整

请告诉我：
- 你的账号主要做什么内容？
- 你的目标受众是谁？
- 你希望传达什么样的人设或品牌形象？`;

// 405: 微博热点分析
const WEIBO_HOTSPOT_WELCOME = `你好！我是你的微博热点分析专家。

我的专长：
- 热点话题的深度解读和趋势预判
- 热点背后的社会现象分析
- 借势营销的策略制定
- 内容创作的热点切入角度

我的工作流程：
1. 了解你关注的热点话题
2. 分析热点的传播路径和用户情绪
3. 解读热点背后的深层原因
4. 提供借势创作的具体建议
5. 预判热点的发展趋势

请告诉我：
- 你想分析哪个热点话题？
- 你的账号定位和内容方向是什么？
- 你希望如何利用这个热点？`;

// 406: 微博账号简介
const WEIBO_BIO_WELCOME = `你好！我是你的微博账号简介撰写专家。

我的专长：
- 用最精炼的文字展现账号价值
- 设计吸引关注的人设标签
- 优化账号的搜索和推荐权重
- 提升账号的专业度和可信度

我的工作流程：
1. 了解你的账号定位和内容方向
2. 分析你的核心优势和差异化特点
3. 生成3-5个不同风格的简介方案
4. 提供关键词和标签建议
5. 根据反馈进行优化调整

请告诉我：
- 你的账号主要做什么内容？
- 你的专业背景或核心优势是什么？
- 你希望给用户留下什么印象？`;

// 407: 微博推文
const WEIBO_TWEET_WELCOME = `# Role: 微博推文创作专家

## Profile
- author: 喵动AI
- version: 1.0
- language: 中文
- description: 我是一位专业的微博推文创作专家，精通微博平台的内容创作规律和用户心理。我能够根据不同的主题和目标，创作出吸引眼球、引发互动的优质微博内容。

## Background
微博作为中国最大的社交媒体平台之一，拥有独特的内容生态和传播机制。一条优秀的微博推文需要在有限的篇幅内，精准传达信息、触动用户情绪、引发互动传播。我深谙微博的算法机制、用户偏好和内容趋势，能够帮助你创作出高质量的微博内容。

## Goals
1. 创作符合微博平台特点的优质推文
2. 精准把握用户心理和情绪触发点
3. 提升内容的传播力和互动率
4. 帮助用户建立个人或品牌影响力

## Skills
1. 深度理解微博平台的内容生态和算法机制
2. 精通各类微博内容的创作技巧（观点、故事、干货、情感等）
3. 擅长设计引发互动的话题和金句
4. 能够结合热点和用户心理提升传播力
5. 熟悉不同领域的内容调性和表达方式

## Workflows
1. 需求分析：了解你的创作主题、目标受众和传播目的
2. 内容策划：确定推文的核心观点、叙事角度和表达方式
3. 文案创作：撰写完整的微博推文内容
4. 优化建议：提供话题标签、配图建议和发布策略
5. 迭代优化：根据你的反馈进行调整和完善

## OutputFormat
我将为你生成完整的微博推文内容，包括：
- 正文内容（控制在合适的字数范围）
- 话题标签建议
- 配图建议
- 发布时间建议
- 预期效果分析

## Constraints
1. 内容必须符合微博平台的社区规范
2. 避免过度营销和硬广
3. 注重内容的真实性和价值
4. 尊重用户的阅读体验

## Initialization
你好！我是你的微博推文创作专家。

请告诉我：
- 你想发布什么主题的微博？
- 你的核心观点或想传达的信息是什么？
- 你的目标受众是谁？
- 你希望达到什么效果？（涨粉/互动/传播观点/品牌宣传等）

让我们一起创作出高质量的微博内容吧！`;

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  switch (templateId) {
    case "401": return WEIBO_SHORT_WELCOME;
    case "402": return WEIBO_LONG_WELCOME;
    case "403": return WEIBO_TITLE_WELCOME;
    case "404": return WEIBO_NAME_WELCOME;
    case "405": return WEIBO_HOTSPOT_WELCOME;
    case "406": return WEIBO_BIO_WELCOME;
    case "407": return WEIBO_TWEET_WELCOME;
    default: return WEIBO_SHORT_WELCOME;
  }
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "401": return "/api/weibo-short";
    case "402": return "/api/weibo-long";
    case "403": return "/api/weibo-title";
    case "404": return "/api/weibo-name";
    case "405": return "/api/weibo-hotspot";
    case "406": return "/api/weibo-bio";
    case "407": return "/api/weibo-tweet";
    default: return "/api/weibo-short";
  }
};

export function WeiboWritingPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "微博短推文";
  const templateId = searchParams.get("template") || "401";
  const source = searchParams.get("source") || "hot";

  // 自动重定向旧ID到新ID
  useEffect(() => {
    const numId = parseInt(templateId);
    const canonicalId = getCanonicalId(numId);
    const template = getTemplateById(canonicalId);

    if (template && canonicalId !== numId) {
      console.warn(`Legacy ID ${numId} detected, redirecting to canonical ID ${canonicalId}`);
      const newUrl = `${template.routePath}?template=${canonicalId}&title=${encodeURIComponent(template.title)}&source=${source}`;
      router.replace(newUrl);
    }
  }, [templateId, router, source]);

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");

  // 对话框状态
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
        const conversationType = getWeiboTypeByTemplateId(parseInt(templateId));
        const conversations = await getConversations(userId, undefined, conversationType);
        setHistoryConversations(conversations);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [userId, templateId]);

  // 初始化欢迎消息
  useEffect(() => {
    const weiboTemplateIds = ["401", "402", "403", "404", "405", "406", "407"];
    if (weiboTemplateIds.includes(templateId) && messages.length === 0) {
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
          const conversationType = getWeiboTypeByTemplateId(parseInt(templateId));
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

    // 重置消息列表为欢迎消息
    const weiboTemplateIds = ["401", "402", "403", "404", "405", "406", "407"];
    if (weiboTemplateIds.includes(templateId)) {
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


  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* 微博所有子类型：统一使用对话模式UI */}
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
    </div>
  );
}

