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
import { getTemplateById, getCanonicalId, isLegacyId } from "@/lib/template-config";
import { mediaStrategyTemplates } from "@/lib/marketing-templates";

// 媒介模块的类型映射函数
const getMediaTypeByTemplateId = (templateId: string): ConversationType => {
  const mapping: Record<string, ConversationType> = {
    '13001': 'media-strategy-proposal',
    '13002': 'media-mix-analysis',
    '13003': 'media-placement-plan',
    '13004': 'media-budget-allocation',
    '13005': 'media-schedule',
    '13006': 'media-resource-procurement',
    '13007': 'ad-placement-selection',
    '13008': 'media-monitoring-report',
    '13009': 'media-evaluation-report',
    '13010': 'media-competition-analysis',
    '13011': 'target-audience-definition',
    '13012': 'media-cost-benefit-analysis',
    '13013': 'media-influence-assessment',
    '13014': 'media-channel-selection',
    '13015': 'media-innovation-proposal',
    '13016': 'cross-media-integration',
  };
  return mapping[templateId] || 'media-strategy-proposal';
};

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  const welcomeMessages: Record<string, string> = {
    "13001": `👋 您好！我是拥有50年跨时代媒体实战经验的策略大师，精通从传统4A方法论到现代数字化营销的全链路策略。

我能帮您：
- 诊断品牌当前面临的市场阻力与机会
- 制定包含目标人群分析、媒体组合策略、预算分配及KPI设定的完整方案
- 优化提案逻辑，将枯燥的数据转化为打动人心的商业故事
- 提供具体的执行建议（如KOL选择标准、投放节奏、危机预警）

在给出方案前，我需要通过3-4个关键问题厘清您的品牌阶段、预算范围和核心目标。

请告诉我：
1. 您的行业、产品是什么？
2. 预算范围和目标受众？
3. 核心挑战是什么？`,

    "13002": `👋 您好！我是您的媒体组合分析大师，拥有50年落地项目经验。

我专注于帮助品牌和企业：
📊 制定科学的媒体投放策略
💡 优化媒体预算配置
🎯 提升营销ROI
🔍 进行竞品媒体分析
📈 建立媒体效果评估体系

我的工作流程：
1. 需求诊断 - 深入了解您的品牌目标和营销诉求
2. 现状分析 - 评估当前媒体投放情况和行业标杆
3. 策略制定 - 设计多套媒体组合方案供您选择
4. 效果预估 - 量化预测不同方案的投放效果
5. 方案优化 - 根据反馈精细化调整策略
6. 持续支持 - 提供执行指导和优化建议

请告诉我：
- 您的品牌或产品是什么？
- 本次营销活动的核心目标是什么？（如品牌知名度、销售转化、用户增长等）
- 您的预算范围和投放周期？
- 目标受众是谁？`,

    "13003": `👋 您好！我是拥有50年一线实战经验的媒体投放专家，精通传统媒体与数字媒体策略。

我能帮您：
- 精准诊断品牌当前的市场阶段与核心痛点
- 制定符合预算与目标的媒体组合策略（Media Mix）
- 提供具体的投放节奏、渠道选择依据及预算分配建议
- 指出执行中可能遇到的风险，并提供优化ROI的专业建议

在开始之前，请告诉我"媒体投放诊断四问"：
1. 产品/服务是什么？
2. 目标受众是谁？
3. 推广预算是多少？
4. 核心目标是什么？（曝光/留资/销量）`,

    "13004": `👋 您好！我是拥有50年媒介实战经验的媒体预算分配大师。

我的专长包括：
✅ 制定科学的媒体预算分配方案
✅ 优化全渠道媒介组合策略
✅ 建立数据驱动的效果评估体系
✅ 提供可直接使用的预算分配工具

我的工作流程是：
1. 需求诊断 - 深入了解您的营销目标、预算和业务情况
2. 策略制定 - 为您设计最优的媒介渠道组合策略
3. 预算分配 - 制定详细的预算配比和投放计划
4. 工具交付 - 提供专业的Excel预算表和追踪工具
5. 优化指导 - 给出执行监控和持续优化建议

现在，请告诉我：
- 您的营销目标是什么？（品牌推广/销售转化/用户增长/其他）
- 您的总预算大约是多少？
- 投放周期计划是多久？
- 您的目标受众是谁？`,

    "13005": `👋 您好！我是拥有50年4A广告公司与本土落地项目经验的媒体总监。

我精通传统媒体（TV/OOH/Print）与数字媒体（Social/Feed/SEM/Programmatic）的组合策略。我极其擅长利用数据逻辑，将复杂的营销目标转化为可视化的、可执行的媒体排期表（Media Flowchart）。

我能帮您：
- 策略清晰化：明确投放阶段（Teasing/Launch/Sustain）和核心打法
- 预算科学化：根据行业标准和经验，合理分配预算比例，预估KPI
- 排期可视化：输出标准的媒体排期表，清晰展示时间、渠道、形式和费用
- 避坑指南：指出方案中的潜在风险点

在输出排期表前，请告诉我：
- 产品类型是什么？
- 总预算是多少？
- 推广周期多长？
- 核心目标是什么？`,
  };
  return welcomeMessages[templateId] || welcomeMessages["13001"];
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "13001": return "/api/media/strategy-proposal";
    case "13002": return "/api/media/mix-analysis";
    case "13003": return "/api/media/placement-plan";
    case "13004": return "/api/media/budget-allocation";
    case "13005": return "/api/media/schedule";
    case "13006": return "/api/media/resource-procurement";
    case "13007": return "/api/media/ad-placement-selection";
    case "13008": return "/api/media/monitoring-report";
    case "13009": return "/api/media/evaluation-report";
    case "13010": return "/api/media/competition-analysis";
    case "13011": return "/api/media/target-audience";
    case "13012": return "/api/media/cost-benefit-analysis";
    case "13013": return "/api/media/influence-assessment";
    case "13014": return "/api/media/channel-selection";
    case "13015": return "/api/media/innovation-proposal";
    case "13016": return "/api/media/cross-media-integration";
    default: return "/api/media/strategy-proposal";
  }
};

export function MediaWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "媒介";
  const templateId = searchParams.get("template") || "13001";
  const source = searchParams.get("source") || "hot";

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
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
        const conversationType = getMediaTypeByTemplateId(templateId);
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
    const mediaTemplateIds = ["13001", "13002", "13003", "13004", "13005", "13006", "13007", "13008", "13009", "13010", "13011", "13012", "13013", "13014", "13015", "13016"];
    if (mediaTemplateIds.includes(templateId) && messages.length === 0) {
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
          messages: conversationHistory.concat([
            { role: 'user', content: userContent }
          ])
        }),
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();

      if (!data.result) {
        throw new Error(data.error || '生成失败');
      }

      // 添加AI回复
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
          const conversationType = getMediaTypeByTemplateId(templateId);
          const convId = await createConversation(userId, title, conversationType);
          setCurrentConversationId(convId);

          await addMessage(convId, 'user', userContent);
          await addMessage(convId, 'assistant', data.result);

          const conversations = await getConversations(userId, undefined, conversationType);
          setHistoryConversations(conversations);
        } catch (dbError) {
          console.error('保存到数据库失败:', dbError);
        }
      } else if (userId && currentConversationId) {
        try {
          await addMessage(currentConversationId, 'user', userContent);
          await addMessage(currentConversationId, 'assistant', data.result);
        } catch (dbError) {
          console.error('保存消息失败:', dbError);
        }
      }

      scrollToBottom();

    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请重试");
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

    const mediaTemplateIds = ["13001", "13002", "13003", "13004", "13005", "13006", "13007", "13008", "13009", "13010", "13011", "13012", "13013", "13014", "13015", "13016"];
    if (mediaTemplateIds.includes(templateId)) {
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
      {/* 媒介模块：统一使用对话模式UI */}
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
                          try {
                            const { getConversationWithMessages } = await import('@/lib/conversations');
                            const conv = await getConversationWithMessages(conversation.id);

                            if (conv && conv.messages) {
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

                              const lastAssistantMsg = conv.messages
                                .filter(m => m.role === 'assistant')
                                .pop();
                              if (lastAssistantMsg) {
                                const plainText = markdownToPlainText(cleanMarkdownClient(lastAssistantMsg.content));
                                setCurrentResult(plainText);
                              }

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
