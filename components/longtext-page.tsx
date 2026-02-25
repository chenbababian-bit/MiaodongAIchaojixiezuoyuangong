"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Sparkles,
  BarChart3,
  Search,
  Upload,
  RefreshCw,
  Send,
  ChevronDown,
  Database,
  Loader2,
} from "lucide-react";
import { MessageBubble } from "@/components/message-bubble";
import { supabase } from "@/lib/supabase";
import { useCredits } from "@/lib/credits-context";
import {
  createConversation,
  getConversations,
  getConversationWithMessages,
  addMessage,
  deleteAllConversations,
  generateConversationTitle,
  type Conversation as DBConversation,
} from "@/lib/conversations";

interface Conversation {
  id: string;
  title: string;
  time: string;
}

export function LongTextPage() {
  const { refreshCredits } = useCredits();
  const [activeTab, setActiveTab] = useState<"qa" | "role">("qa");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [deepThink, setDeepThink] = useState(false);
  const [aiChart, setAiChart] = useState(false);
  const [wordCount, setWordCount] = useState("3000字");
  const [searchEnabled, setSearchEnabled] = useState(false);

  // 消息状态管理
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isCollapsed: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取当前用户
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // 加载对话列表
        loadConversations(user.id);
      }
    };
    getUser();
  }, []);

  // 加载对话列表
  const loadConversations = async (uid: string) => {
    const dbConversations = await getConversations(uid, activeTab);
    const formattedConversations: Conversation[] = dbConversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      time: new Date(conv.updated_at).toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    setConversations(formattedConversations);
  };

  // 当切换tab时重新加载对话列表
  useEffect(() => {
    if (userId) {
      loadConversations(userId);
    }
  }, [activeTab, userId]);

  // 加载对话的历史消息
  const loadConversationMessages = async (conversationId: string) => {
    const conversation = await getConversationWithMessages(conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      const formattedMessages = conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        isCollapsed: false
      }));
      setMessages(formattedMessages);
      setError("");
      // 滚动到底部
      setTimeout(scrollToBottom, 100);
    } else {
      setError("加载对话失败");
    }
  };

  const handleNewConversation = async () => {
    if (!userId) {
      setError("请先登录");
      return;
    }

    // 创建新对话
    const newConvId = await createConversation(userId, "新会话", activeTab);
    if (newConvId) {
      setCurrentConversationId(newConvId);
      setMessages([]);
      setError("");
      // 重新加载对话列表
      loadConversations(userId);
    } else {
      setError("创建对话失败");
    }
  };

  const handleClearAll = async () => {
    if (!userId) return;

    const success = await deleteAllConversations(userId, activeTab);
    if (success) {
      setConversations([]);
      setMessages([]);
      setCurrentConversationId(null);
    } else {
      setError("删除对话失败");
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 消息折叠/展开
  const handleToggleCollapse = (messageId: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isCollapsed: !msg.isCollapsed } : msg
    ));
  };

  // 发送消息处理函数
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    if (!userId) {
      setError("请先登录");
      return;
    }

    const userContent = inputValue.trim();

    // 如果没有当前对话，先创建一个
    let convId = currentConversationId;
    if (!convId) {
      const title = generateConversationTitle(userContent);
      const newConvId = await createConversation(userId, title, activeTab);
      if (!newConvId) {
        setError("创建对话失败");
        return;
      }
      convId = newConvId;
      setCurrentConversationId(convId);
      // 重新加载对话列表
      loadConversations(userId);
    }

    // 添加用户消息到UI
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userContent,
      isCollapsed: false
    };
    setMessages(prev => [...prev, userMessage]);

    // 清空输入框
    setInputValue('');

    // 调用API
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: userContent,
          deepThink,
          searchEnabled
        }),
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || '生成失败');
      }

      // 添加AI回复到UI
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.result,
        isCollapsed: false
      };
      setMessages(prev => [...prev, aiMessage]);
      // 刷新积分显示
      refreshCredits();

      // 保存用户消息和AI回复到数据库
      await addMessage(convId, 'user', userContent);
      await addMessage(convId, 'assistant', data.result);

      // 重新加载对话列表（更新时间）
      loadConversations(userId);

      // 滚动到底部
      setTimeout(scrollToBottom, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请重试");
      // 如果失败，移除用户消息
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Panel - Conversations */}
      <div className="w-[280px] border-r border-border bg-card flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("qa")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative",
              activeTab === "qa"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            问答助手
            {activeTab === "qa" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("role")}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors relative",
              activeTab === "role"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            角色助手
            {activeTab === "role" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-4">
          <Button onClick={handleNewConversation} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            新建会话
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无会话记录
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => loadConversationMessages(convo.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors",
                    currentConversationId === convo.id
                      ? "bg-primary/10 border border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {convo.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {convo.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear All Button */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            清除所有会话
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            // 空状态
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-lg font-medium text-foreground mb-2">
                  开始新的对话
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  输入您的问题或需求，AI助手将为您提供专业的解答和创作支持
                </p>
              </div>
            </div>
          ) : (
            // 消息列表
            <div className="space-y-4 max-w-4xl mx-auto w-full">
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

              {/* 错误提示 */}
              {error && (
                <div className="flex justify-center">
                  <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
                    {error}
                  </div>
                </div>
              )}

              {/* 滚动锚点 */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Button
              variant={deepThink ? "default" : "outline"}
              size="sm"
              onClick={() => setDeepThink(!deepThink)}
              className="gap-2 h-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              深度思考 (R1)
            </Button>

            <Button
              variant={aiChart ? "default" : "outline"}
              size="sm"
              onClick={() => setAiChart(!aiChart)}
              className="gap-2 h-8"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              AI图表
            </Button>

            <div className="relative">
              <Button variant="outline" size="sm" className="gap-2 h-8 bg-transparent">
                {wordCount}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">搜索</span>
              <button
                onClick={() => setSearchEnabled(!searchEnabled)}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors",
                  searchEnabled ? "bg-primary" : "bg-muted"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    searchEnabled ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            <Button variant="outline" size="sm" className="gap-2 h-8 bg-transparent">
              <Database className="h-3.5 w-3.5" />
              选择知识库
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>

            <Button variant="outline" size="sm" className="gap-2 h-8 bg-transparent">
              <Upload className="h-3.5 w-3.5" />
              上传文件
            </Button>

            <Button variant="outline" size="sm" className="gap-2 h-8 bg-transparent">
              <RefreshCw className="h-3.5 w-3.5" />
              清空
            </Button>
          </div>

          {/* Input Box */}
          <div className="relative">
            <Textarea
              placeholder="请输入问题 (Shift + Enter) = 换行"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-[80px] pr-20 resize-none bg-background"
            />
            <Button
              size="sm"
              className="absolute bottom-3 right-3 gap-2"
              disabled={!inputValue.trim() || isLoading}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
