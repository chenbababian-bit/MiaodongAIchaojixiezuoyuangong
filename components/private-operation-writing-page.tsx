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
  type Conversation as DBConversation,
  type ConversationType,
} from "@/lib/conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import { useCredits } from "@/lib/credits-context";

// 私域运营模块的类型映射函数
const getPrivateOperationTypeByTemplateId = (templateId: string): ConversationType => {
  // 所有私域运营模板都使用统一的对话类型前缀
  const id = parseInt(templateId);
  if (id >= 14001 && id <= 14010) return 'private-user-growth' as ConversationType;
  if (id >= 14011 && id <= 14020) return 'private-community' as ConversationType;
  if (id >= 14021 && id <= 14030) return 'private-content' as ConversationType;
  if (id >= 14031 && id <= 14040) return 'private-interaction' as ConversationType;
  if (id >= 14041 && id <= 14050) return 'private-data-analysis' as ConversationType;
  if (id >= 14051 && id <= 14060) return 'private-marketing' as ConversationType;
  if (id >= 14061 && id <= 14070) return 'private-team' as ConversationType;
  if (id >= 14071 && id <= 14080) return 'private-compliance' as ConversationType;
  return 'private-user-growth' as ConversationType;
};

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  const id = parseInt(templateId);

  // 用户增长类 (14001-14010)
  if (id >= 14001 && id <= 14010) {
    return `👋 您好！我是私域运营领域的资深专家，专注于用户增长策略。

我能帮您：
- 分析目标用户画像，精准定位潜在客户
- 设计高效的用户获取和转化策略
- 制定用户激活和留存计划
- 构建用户生命周期价值模型

在开始之前，请告诉我：
1. 您的行业和产品/服务是什么？
2. 目前的用户规模和增长目标？
3. 主要的用户获取渠道有哪些？
4. 当前面临的最大挑战是什么？`;
  }

  // 社群运营类 (14011-14020)
  if (id >= 14011 && id <= 14020) {
    return `👋 您好！我是社群运营领域的资深专家，拥有丰富的社群搭建和运营经验。

我能帮您：
- 设计社群架构和运营规划
- 制定社群规则和管理规范
- 策划社群活动提升活跃度
- 培训社群管理团队

在开始之前，请告诉我：
1. 您的社群定位和目标用户是什么？
2. 目前社群的规模和活跃度如何？
3. 社群的核心价值和内容方向？
4. 希望通过社群实现什么目标？`;
  }

  // 内容生产类 (14021-14030)
  if (id >= 14021 && id <= 14030) {
    return `👋 您好！我是私域内容运营的资深专家，专注于高质量内容策划和生产。

我能帮您：
- 制定内容营销策略和日程安排
- 设计内容创意和编辑指南
- 建立内容质量标准和审核流程
- 激励用户生成优质UGC内容

在开始之前，请告诉我：
1. 您的品牌定位和目标受众是什么？
2. 目前的内容产出频率和渠道？
3. 内容团队的规模和能力？
4. 希望通过内容实现什么效果？`;
  }

  // 用户互动类 (14031-14040)
  if (id >= 14031 && id <= 14040) {
    return `👋 您好！我是用户互动运营的资深专家，专注于提升用户参与度和满意度。

我能帮您：
- 设计用户互动活动和激励机制
- 建立用户反馈处理流程
- 制定用户关怀和忠诚度计划
- 优化用户体验和服务流程

在开始之前，请告诉我：
1. 您的用户群体特征是什么？
2. 目前的用户互动方式有哪些？
3. 用户反馈的主要渠道和问题？
4. 希望提升哪些用户体验指标？`;
  }

  // 数据分析类 (14041-14050)
  if (id >= 14041 && id <= 14050) {
    return `👋 您好！我是私域数据分析的资深专家，专注于数据驱动的运营决策。

我能帮您：
- 分析用户行为和流量数据
- 构建用户分层和画像体系
- 评估社群影响力和运营效果
- 制定数据驱动的营销策略

在开始之前，请告诉我：
1. 您目前有哪些数据来源？
2. 主要关注的运营指标有哪些？
3. 数据分析的主要目的是什么？
4. 希望通过数据解决什么问题？`;
  }

  // 营销转化类 (14051-14060)
  if (id >= 14051 && id <= 14060) {
    return `👋 您好！我是私域营销转化的资深专家，专注于提升转化率和销售业绩。

我能帮您：
- 策划营销活动和促销方案
- 优化转化漏斗和销售流程
- 设计会员权益和优惠策略
- 分析客户案例提升转化效果

在开始之前，请告诉我：
1. 您的产品/服务和价格定位？
2. 目前的转化率和销售目标？
3. 主要的营销渠道和方式？
4. 希望重点提升哪个转化环节？`;
  }

  // 团队管理类 (14061-14070)
  if (id >= 14061 && id <= 14070) {
    return `👋 您好！我是私域团队管理的资深专家，专注于团队建设和效能提升。

我能帮您：
- 制定团队角色和职责分工
- 设计KPI考核和激励机制
- 规划团队培训和成长路径
- 建立团队协作和沟通规范

在开始之前，请告诉我：
1. 您的团队规模和架构是什么？
2. 团队成员的能力和背景？
3. 目前团队面临的主要挑战？
4. 希望团队达成什么目标？`;
  }

  // 合规管理类 (14071-14080)
  if (id >= 14071 && id <= 14080) {
    return `👋 您好！我是私域合规管理的资深专家，专注于风险防控和合规运营。

我能帮您：
- 制定数据隐私和安全政策
- 建立合规检查和审计流程
- 识别运营风险和应对策略
- 更新用户协议和服务条款

在开始之前，请告诉我：
1. 您的业务类型和用户规模？
2. 目前的合规管理现状？
3. 主要关注的合规风险？
4. 希望解决什么合规问题？`;
  }

  return `👋 您好！我是私域运营领域的资深专家。

请告诉我您的具体需求，我将为您提供专业的指导和方案。`;
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  return `/api/private-operation/${templateId}`;
};

export function PrivateOperationWritingPage() {
  const router = useRouter();
  const { refreshCredits } = useCredits();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "私域运营";
  const templateId = searchParams.get("template") || "14001";
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
        const conversationType = getPrivateOperationTypeByTemplateId(templateId);
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
    const id = parseInt(templateId);
    if (id >= 14001 && id <= 14080 && messages.length === 0) {
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
          const conversationType = getPrivateOperationTypeByTemplateId(templateId);
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

    const id = parseInt(templateId);
    if (id >= 14001 && id <= 14080) {
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
      {/* 私域运营模块：统一使用对话模式UI */}
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
