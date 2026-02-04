"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  getToutiaoTypeByTemplateId,
  type Conversation as DBConversation,
} from "@/lib/conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import { getTemplateById, getCanonicalId } from "@/lib/template-config";

// 今日头条5个子功能的示例提问
const examplePromptsByTemplate: Record<string, string[]> = {
  // 301: 头条爆文
  "301": [
    "我想写一篇关于人工智能如何改变教育行业的深度文章，目标读者是教育工作者和家长",
    "我是健身教练，想分享一篇关于科学减脂的干货文章，帮助读者避开常见误区",
    "我想写一篇职场成长类文章，主题是如何在30岁前实现职业突破"
  ],
  // 302: 头条爆款标题
  "302": [
    "我写了一篇关于理财投资的文章，内容包括基金、股票和保险的配置建议，帮我设计吸引人的标题",
    "我的文章是分享育儿经验，主要讲如何培养孩子的自律能力，需要一个高点击率的标题",
    "我整理了一份程序员转行指南，包含10个热门方向和薪资对比，想要一个能引发共鸣的标题"
  ],
  // 303: 头条问答
  "303": [
    "有人问：为什么现在的年轻人都不愿意加班了？我想从职场文化变迁的角度回答这个问题",
    "问题：如何在三个月内从零基础学会Python编程？我想提供一个系统的学习路径",
    "有人问：买房和租房哪个更划算？我想从经济学角度深度分析这个问题"
  ],
  // 304: 微头条文案
  "304": [
    "我想分享一个关于时间管理的小技巧，帮助大家提高工作效率",
    "我发现了一个超好用的生活小妙招，想用微头条的形式分享给大家",
    "我想发一条关于读书感悟的微头条，主题是《活着》这本书给我的启发"
  ],
  // 305: 头条文章大纲
  "305": [
    "我想写一篇关于副业赚钱的文章，帮我策划一个完整的大纲",
    "我准备写一篇健康养生类文章，主题是如何科学养护肠胃，需要一个详细的大纲",
    "我想写一篇职场干货文章，主题是新人如何快速融入团队，帮我设计文章结构"
  ],
  // 默认示例
  "default": [
    "我想创作一篇今日头条文章，主题是...",
    "我需要一个吸引人的标题，内容是关于...",
    "我想回答一个热门问题..."
  ]
};

// 今日头条5个子功能的欢迎消息
// 301: 头条爆文
const TOUTIAO_ARTICLE_WELCOME = `你好！我是你的今日头条爆款文章创作专家，专精于今日头条等聚合类资讯平台的内容创作。我擅长通过大数据分析捕捉热点，利用SEO技巧优化标题，并结合用户心理撰写高完读率、高互动率的爆款文章。

我的工作流程：
1. 需求询问：了解您想要创作的领域或大致主题
2. 热点匹配：分析当前该领域的热门话题，提供3个具体的选题方向
3. 标题生成：生成5个带有SEO优化的爆款标题
4. 大纲构建：输出文章大纲（包括引言、核心观点段落、金句、结尾升华）
5. 正文撰写：根据大纲撰写全篇正文

请问您今天想写关于哪个领域的文章？或者有什么具体的关键词？`;

// 302: 头条爆款标题
const TOUTIAO_TITLE_WELCOME = `👋 你好！我是你的头条爆款标题专家，拥有20年新媒体标题创作实战经验。

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
4. 准备在哪个平台发布？
5. 内容类型是？（干货教程/观点评论/故事分享/资讯报道等）

让我们一起创作出让人忍不住点击的爆款标题吧！🚀`;

// 303: 头条问答
const TOUTIAO_QA_WELCOME = `👋 你好！我是你的头条问答专家助手，很高兴为你服务！

我专注于帮助你在今日头条问答平台创作优质内容，提升影响力。我擅长：
- 🎯 挖掘热门话题和流量选题
- 💡 设计吸引眼球的优质问题
- ✍️ 撰写深度实用的高质量答案
- 📈 提供内容优化和运营建议

我的工作流程：
1. 先了解你的内容方向和目标受众
2. 为你推荐几个高潜力话题选择
3. 设计具有吸引力的问题
4. 撰写完整的优质答案
5. 根据你的反馈优化调整

现在，请告诉我：你想在哪个领域创作内容？（比如科技、健康、职场、生活技巧等）或者你有什么具体的选题想法吗？让我们一起打造爆款问答内容！🚀`;

// 304: 微头条文案
const TOUTIAO_WEITOUTIAO_WELCOME = `👋 你好！我是你的微头条文案生成专家，专注于为微头条平台创作短小精悍、高吸引力的爆款文案！

🎯 我能帮你实现：
- 3秒抓住用户眼球的强开头设计
- 简洁高效的核心信息传递
- 引发用户互动的情感共鸣
- 塑造独特的个人/品牌IP形象

💡 我的工作流程：
1. 了解你的创作主题和目标受众
2. 收集你想传达的核心信息
3. 为你生成3-5个不同风格的文案方案
4. 根据你的选择进行精细化优化
5. 提供发布策略和配套建议

📝 现在，请告诉我：
- 你想创作什么主题的微头条？
- 你的目标受众是谁？
- 你希望达到什么目的？（涨粉/引流/互动/品牌塑造等）

让我们一起创作出刷屏级的微头条文案吧！🚀`;

// 305: 头条文章大纲
const TOUTIAO_OUTLINE_WELCOME = `你好！我是你的头条爆款文章大纲策划专家。我擅长捕捉市场热点，深挖读者心理，帮你把一个简单的想法变成一篇结构严谨、流量满满的爆款文章。

我的工作流程：
1. 需求采集：了解你想要写的文章主题、大致方向或手头的素材
2. 定位与选题：分析目标读者群体，结合当前趋势，提供3个具有爆款潜质的选题角度/标题供你选择
3. 大纲生成：生成详细大纲，包含标题方案、引言、主体、结语
4. 优化迭代：根据你的反馈进行精修或调整

请告诉我，你今天想写什么主题？或者你有什么初步的想法/关键词？`;

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  switch (templateId) {
    case "301": return TOUTIAO_ARTICLE_WELCOME;
    case "302": return TOUTIAO_TITLE_WELCOME;
    case "303": return TOUTIAO_QA_WELCOME;
    case "304": return TOUTIAO_WEITOUTIAO_WELCOME;
    case "305": return TOUTIAO_OUTLINE_WELCOME;
    default: return TOUTIAO_ARTICLE_WELCOME;
  }
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "301": return "/api/toutiao-article";
    case "302": return "/api/toutiao-title";
    case "303": return "/api/toutiao-qa";
    case "304": return "/api/toutiao-weitoutiao";
    case "305": return "/api/toutiao-outline";
    default: return "/api/toutiao-article";
  }
};

export function ToutiaoWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "头条爆文";
  const templateId = searchParams.get("template") || "301";
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
        const conversationType = getToutiaoTypeByTemplateId(parseInt(templateId));
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
    const toutiaoTemplateIds = ["301", "302", "303", "304", "305"];
    if (toutiaoTemplateIds.includes(templateId) && messages.length === 0) {
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
          const conversationType = getToutiaoTypeByTemplateId(parseInt(templateId));
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
    const toutiaoTemplateIds = ["301", "302", "303", "304", "305"];
    if (toutiaoTemplateIds.includes(templateId)) {
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

  // 根据source参数判断返回路径
  const getBackPath = () => {
    if (source === "hot") {
      return "/";
    } else if (source.startsWith("media-")) {
      return "/?category=media";
    } else {
      return "/";
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* 今日头条所有子类型：统一使用对话模式UI */}
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
    </div>
  );
}

