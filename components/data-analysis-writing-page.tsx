"use client";

import { useState, useEffect, useRef } from "react";
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
  getDataAnalysisTypeByTemplateId,
  type Conversation as DBConversation,
} from "@/lib/conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";

// 数据分析6个子类型的AI欢迎消息
// 5001: 短视频播放分析
const DATA_ANALYSIS_VIDEO_PLAY_WELCOME = `👋 您好!我是您的短视频播放数据分析顾问,拥有50年落地项目经验,专注于帮助创作者和运营者解决短视频播放数据相关的各类难题。

### 我能为您提供的服务:
- 📊 **数据深度诊断**: 分析播放量、完播率、互动率等核心指标,快速定位问题
- 🎬 **内容优化方案**: 从视频节奏、钩子设计、信息密度等维度提升内容质量
- 🔍 **算法机制解读**: 帮助您理解平台推荐逻辑,获得更多自然流量
- 🏆 **爆款案例拆解**: 分析同领域成功视频,提取可复制的方法论
- 📈 **运营策略规划**: 制定系统化的账号增长和变现路径

### 我的工作流程:
需求确认 → 数据诊断 → 方案输出 → 答疑指导 → 持续优化

请告诉我:
1. 您目前在短视频运营中遇到的**最核心问题**是什么?
2. 您的账号运营在**哪个平台**(抖音/快手/视频号等)?
3. 方便分享一下您**近期几条视频的数据表现**吗?(播放量、完播率、点赞等)

有了这些信息,我就能为您提供更精准的分析和建议! 🚀`;

// 5002: 短视频观众分析
const DATA_ANALYSIS_VIDEO_AUDIENCE_WELCOME = `您好!我是您的短视频观众分析大师顾问,拥有50年短视频行业实战经验。我专注于帮助创作者深度理解观众、优化内容策略、突破流量瓶颈,最终实现账号增长与商业变现。

我的服务涵盖:
- 📊 **观众画像分析**: 精准洞察您的目标观众特征与需求
- 🎯 **内容策略优化**: 基于数据提供爆款选题和内容改进建议
- 📈 **数据深度解读**: 诊断流量问题,发现增长机会点
- 💰 **变现路径规划**: 设计符合您账号特征的商业化方案
- 🤖 **平台算法适配**: 优化内容以获得更多平台推荐

**我的工作流程是**:
1️⃣ 先了解您的账号现状和核心诉求
2️⃣ 基于数据进行多维度问题诊断
3️⃣ 提供可落地的解决方案和执行建议
4️⃣ 解答疑问并持续优化策略

现在,请告诉我:
- 您目前在哪个平台做短视频?(抖音/快手/视频号等)
- 您的内容领域是什么?(如美食/知识/娱乐等)
- 您当前遇到的最大困扰是什么?

让我们一起为您的短视频事业制定专业的突破方案! 🚀`;

// 5003: 直播成交数据分析
const DATA_ANALYSIS_LIVE_SALES_WELCOME = `👋 您好!我是您的直播成交数据分析专家,拥有50年直播电商实战经验,专注于帮助主播和商家提升直播间成交转化率。

### 我能为您提供的服务:
- 💰 **成交数据诊断**: 分析GMV、客单价、转化率等核心指标,找出转化瓶颈
- 🎯 **转化路径优化**: 从引流、留存到成交全链路优化策略
- 📊 **商品组合策略**: 优化商品结构、定价策略和促销节奏
- 🎬 **话术脚本优化**: 提升主播销售能力和产品讲解效果
- 📈 **ROI提升方案**: 降低获客成本,提高投产比

### 我的工作流程:
数据收集 → 问题诊断 → 策略制定 → 执行指导 → 效果追踪

请告诉我:
1. 您的直播间目前**平均GMV和转化率**是多少?
2. 您在**哪个平台**直播?(抖音/快手/淘宝等)
3. 您目前遇到的**最大转化难题**是什么?

有了这些信息,我将为您提供专业的成交优化方案! 🚀`;

// 5004: 直播观看数据分析
const DATA_ANALYSIS_LIVE_VIEW_WELCOME = `您好!我是您的直播观看数据分析顾问,拥有50年直播运营实战经验,专注于帮助主播提升直播间人气和观众留存。

### 我的核心服务:
- 📊 **流量数据诊断**: 分析在线人数、观看时长、进入率等核心指标
- 🎯 **流量获取策略**: 优化自然流量和付费流量的获取效率
- 👥 **观众留存优化**: 提升观众停留时长和互动参与度
- 🎬 **直播内容优化**: 改进直播节奏、话题设计和互动环节
- 📈 **增长策略规划**: 制定系统化的直播间增长路径

### 我的工作流程:
1️⃣ 了解您的直播间现状和核心诉求
2️⃣ 基于数据进行多维度问题诊断
3️⃣ 提供可落地的优化方案
4️⃣ 持续跟进和策略调整

现在,请告诉我:
- 您在**哪个平台**直播?(抖音/快手/视频号等)
- 您的直播间**平均在线人数**和**观看时长**是多少?
- 您目前遇到的**最大流量困扰**是什么?

让我们一起打造高人气直播间! 🚀`;

// 5005: 短视频互动分析
const DATA_ANALYSIS_VIDEO_INTERACTION_WELCOME = `👋 您好!我是您的短视频互动数据分析专家,拥有50年内容运营实战经验,专注于帮助创作者提升视频互动率和粉丝粘性。

### 我能为您提供的服务:
- 📊 **互动数据诊断**: 分析点赞率、评论率、转发率等核心互动指标
- 💬 **评论区运营**: 优化评论引导策略,提升用户参与度
- 🎯 **粉丝粘性提升**: 建立粉丝社群,提高粉丝忠诚度
- 🎬 **内容互动设计**: 优化视频互动点设计,激发用户行为
- 📈 **算法权重优化**: 提升互动数据以获得更多平台推荐

### 我的工作流程:
数据分析 → 问题定位 → 策略输出 → 执行指导 → 效果优化

请告诉我:
1. 您的视频**平均互动率**(点赞率、评论率)是多少?
2. 您在**哪个平台**创作?(抖音/快手/视频号等)
3. 您目前遇到的**最大互动难题**是什么?

有了这些信息,我将为您提供专业的互动优化方案! 🚀`;

// 5006: 短视频成交分析
const DATA_ANALYSIS_VIDEO_SALES_WELCOME = `您好!我是您的短视频成交数据分析大师,拥有50年短视频电商实战经验,专注于帮助创作者和商家通过短视频实现高效转化和变现。

### 我的核心服务:
- 💰 **成交数据诊断**: 分析点击率、转化率、客单价等核心成交指标
- 🎯 **转化漏斗优化**: 从曝光到成交全链路转化率提升
- 📊 **选品策略优化**: 基于数据优化商品选择和定价策略
- 🎬 **种草内容优化**: 提升视频种草能力和购买引导效果
- 📈 **ROI提升方案**: 降低获客成本,提高投产比和利润率

### 我的工作流程:
1️⃣ 了解您的账号现状和变现目标
2️⃣ 基于数据进行转化问题诊断
3️⃣ 提供可落地的成交优化方案
4️⃣ 持续跟进和策略调整

现在,请告诉我:
- 您在**哪个平台**做短视频带货?(抖音/快手/视频号等)
- 您的视频**平均转化率和客单价**是多少?
- 您目前遇到的**最大成交难题**是什么?

让我们一起打造高转化的短视频变现体系! 🚀`;

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  switch (templateId) {
    case "5001": return DATA_ANALYSIS_VIDEO_PLAY_WELCOME;
    case "5002": return DATA_ANALYSIS_VIDEO_AUDIENCE_WELCOME;
    case "5003": return DATA_ANALYSIS_LIVE_SALES_WELCOME;
    case "5004": return DATA_ANALYSIS_LIVE_VIEW_WELCOME;
    case "5005": return DATA_ANALYSIS_VIDEO_INTERACTION_WELCOME;
    case "5006": return DATA_ANALYSIS_VIDEO_SALES_WELCOME;
    default: return DATA_ANALYSIS_VIDEO_PLAY_WELCOME;
  }
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "5001": return "/api/video-play-analysis";
    case "5002": return "/api/video-audience-analysis";
    case "5003": return "/api/live-sales-analysis";
    case "5004": return "/api/live-view-analysis";
    case "5005": return "/api/video-interaction-analysis";
    case "5006": return "/api/video-sales-analysis";
    default: return "/api/video-play-analysis";
  }
};

export function DataAnalysisWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "数据分析";
  const templateId = searchParams.get("template") || "5001";
  const source = searchParams.get("source") || "hot";

  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");

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
        const conversationType = getDataAnalysisTypeByTemplateId(parseInt(templateId));
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
    const dataAnalysisTemplateIds = ["5001", "5002", "5003", "5004", "5005", "5006"];
    if (dataAnalysisTemplateIds.includes(templateId) && messages.length === 0) {
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
          const conversationType = getDataAnalysisTypeByTemplateId(parseInt(templateId));
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

    const dataAnalysisTemplateIds = ["5001", "5002", "5003", "5004", "5005", "5006"];
    if (dataAnalysisTemplateIds.includes(templateId)) {
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
    } else if (source.startsWith("data-analysis")) {
      return "/?category=data-analysis";
    } else {
      return "/";
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
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
