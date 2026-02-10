"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BackButton } from "@/components/ui/back-button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Copy,
  Check,
  Plus,
  Send,
  History,
  Sparkles,
} from "lucide-react";
import { MessageBubble } from "@/components/message-bubble";
import { supabase } from "@/lib/supabase";
import { cleanMarkdownClient } from "@/lib/markdown-cleaner-client";
import {
  createConversation,
  getConversations,
  addMessage,
  getZhihuTypeByTemplateId,
  type Conversation as DBConversation,
} from "@/lib/conversations";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import { zhihuTemplates } from "@/components/media-page";

// 将markdown转换为纯文本（用于编辑器显示）
function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.+?\)/g, "")
    .replace(/>\s+/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// 知乎5个子类型的AI欢迎消息
// 501: 知乎高赞问答
const ZHIHU_QA_WELCOME = `你好！我是你的知乎高赞问答创作助手，专注于帮助你创作出能够获得高赞的优质问答内容。

我擅长：
- 深度分析问题，提供有价值的见解
- 结构化组织答案，逻辑清晰
- 运用数据和案例支撑观点
- 把握知乎用户的阅读习惯和偏好

请告诉我：
1. 你想回答什么问题？
2. 你的专业背景或独特视角是什么？
3. 你希望传达什么核心观点？

让我们一起打造高赞回答！`;

// 502: 知乎高赞回答仿写
const ZHIHU_ANSWER_WELCOME = `你好！我是你的知乎高赞回答仿写专家，能够帮你学习和借鉴优秀回答的写作技巧。

我能帮你：
- 分析高赞回答的结构和亮点
- 提取可复用的写作模式
- 结合你的内容创作新回答
- 保持原创性的同时学习优秀范例

请告诉我：
1. 你想仿写的高赞回答链接或内容
2. 你要回答的具体问题
3. 你的独特观点或素材

让我帮你创作出同样精彩的回答！`;

// 503: 知乎账号个人简介
const ZHIHU_BIO_WELCOME = `你好！我是你的知乎个人简介优化专家，专注于打造吸引人的个人IP。

一个好的知乎简介能够：
- 快速建立专业形象
- 吸引目标读者关注
- 提升回答的可信度
- 增加个人影响力

请告诉我：
1. 你的职业/身份
2. 你的专业领域或擅长方向
3. 你的独特经历或成就
4. 你希望在知乎分享什么内容

我会为你打造一个专业又有个性的简介！`;

// 504: 知乎一句话简介
const ZHIHU_TAGLINE_WELCOME = `你好！我是你的知乎一句话简介创作专家，擅长用最精炼的语言展现你的特色。

一句话简介的关键：
- 简洁有力，一眼记住
- 突出核心价值
- 体现个人特色
- 引发好奇和共鸣

请告诉我：
1. 你的核心身份标签
2. 你最想让别人记住的特点
3. 你的风格偏好（专业/幽默/文艺等）

让我为你创作一句让人印象深刻的简介！`;

// 505: 知乎账号名称
const ZHIHU_USERNAME_WELCOME = `你好！我是你的知乎账号名称策划专家，帮你打造一个好记又有辨识度的名字。

好的账号名称应该：
- 简洁易记，朗朗上口
- 体现领域或特色
- 有一定的辨识度
- 符合知乎平台调性

请告诉我：
1. 你的内容定位（科技/职场/生活等）
2. 你希望传达的形象（专业/亲和/个性等）
3. 有没有特别想包含的关键词
4. 你的风格偏好

我会为你提供多个优质选项！`;

// 获取当前模板对应的欢迎消息
function getWelcomeMessage(templateId: string): string {
  switch (templateId) {
    case "501": return ZHIHU_QA_WELCOME;
    case "502": return ZHIHU_ANSWER_WELCOME;
    case "503": return ZHIHU_BIO_WELCOME;
    case "504": return ZHIHU_TAGLINE_WELCOME;
    case "505": return ZHIHU_USERNAME_WELCOME;
    default: return ZHIHU_QA_WELCOME;
  }
}

// 获取当前模板对应的API端点
function getApiEndpoint(templateId: string): string {
  switch (templateId) {
    case "501": return "/api/zhihu-qa";
    case "502": return "/api/zhihu-answer";
    case "503": return "/api/zhihu-bio";
    case "504": return "/api/zhihu-tagline";
    case "505": return "/api/zhihu-username";
    default: return "/api/zhihu-qa";
  }
}

export function ZhihuWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "知乎高赞问答";
  const templateId = searchParams.get("template") || "501";
  const source = searchParams.get("source") || "media-zhihu";

  // 状态管理
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isCollapsed: boolean;
  }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputHeight, setInputHeight] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentResult, setCurrentResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [resultTab, setResultTab] = useState<"current" | "history">("current");

  // 对话历史
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  // 用户认证和历史记录
  const [userId, setUserId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [historyConversations, setHistoryConversations] = useState<DBConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  // 初始化欢迎消息
  useEffect(() => {
    const zhihuTemplateIds = ["501", "502", "503", "504", "505"];
    if (zhihuTemplateIds.includes(templateId) && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: cleanMarkdownClient(getWelcomeMessage(templateId)),
        isCollapsed: false
      }]);
    }
  }, [templateId]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;

      setIsLoadingHistory(true);
      try {
        const conversationType = getZhihuTypeByTemplateId(parseInt(templateId));
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
          const conversationType = getZhihuTypeByTemplateId(parseInt(templateId));
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
    const zhihuTemplateIds = ["501", "502", "503", "504", "505"];
    if (zhihuTemplateIds.includes(templateId)) {
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: cleanMarkdownClient(getWelcomeMessage(templateId)),
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


  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* 统一使用对话模式UI */}
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
                <History className="h-4 w-4 mr-1" />
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
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-sm">AI生成的内容将显示在这里</p>
                    </div>
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
                      <History className="h-10 w-10 text-muted-foreground/50" />
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
