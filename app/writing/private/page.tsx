"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
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
  type PrivateType,
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
import { privateTemplates } from "@/components/media-page";
import { getTemplateById, getCanonicalId } from "@/lib/template-config";

// 私域运营7个子类型的AI欢迎消息
// 601: 私域日常文案库
const PRIVATE_DAILY_WELCOME = `您好!我是私域日常文案库大师,拥有50年私域运营落地项目经验,专注于为企业和个人IP提供全方位的私域文案解决方案。

我可以帮您:
- 📝 创作高转化的朋友圈、社群、私聊等各场景文案
- 📚 搭建系统化、可复用的私域文案库体系
- 🎯 制定针对性的私域内容策略和运营规划
- 💬 优化客户沟通话术,提升转化效率
- 🚀 提供营销节点的文案策划和执行方案

**接下来的工作流程**:
1. 我会先了解您的行业、产品、目标客户和具体需求
2. 然后为您制定专属的私域文案策略
3. 根据您的场景创作高质量文案或搭建文案库
4. 最后提供落地指导,确保文案真正发挥作用

请告诉我,您目前在私域运营中遇到了什么文案难题?或者您希望我帮您做什么?`;

// 602: 私域朋友圈发文计划库
const PRIVATE_MOMENTS_WELCOME = `你好！我是拥有50年私域实战经验的朋友圈营销架构师。在这个'注意力比金子贵'的时代，我不只是帮你写文案，更是帮你经营信任。

请告诉我：

1. 你在从事什么**行业**？
2. 你希望通过朋友圈达成什么**目标**（卖货、招商、还是打造个人品牌）？
3. 你的客户群体主要是**谁**？

我会根据你的情况，先为你输出一套专属的人格化运营方案。`;

// 603: 私域价值感文案库
const PRIVATE_VALUE_WELCOME = `你好!我是私域价值感文案库大师,在私域运营领域深耕50年,帮助过上千家企业搭建高转化的文案体系。

我可以帮你:
✅ 构建完整的私域文案库(引流→转化→复购全链路)
✅ 提升文案价值感,让客户感受到"物超所值"
✅ 定制各种场景的文案模板(节日营销、产品上新、社群运营等)
✅ 诊断优化现有文案,提升转化率
✅ 传授私域文案的底层逻辑和创作方法

为了给你最精准的帮助,我想了解:
1. 你目前在做什么行业的私域运营?
2. 你的目标客户是哪类人群?
3. 你现在遇到的最大文案难题是什么?

告诉我你的情况,我会为你量身定制解决方案!`;

// 604: 私域产品营销文案库
const PRIVATE_MARKETING_WELCOME = `您好！我是**私域营销文案库大师**，拥有50年私域营销落地项目经验，专注于为企业和个人打造高转化的私域营销文案体系。

我能帮您解决：
- ✅ 构建完整的私域营销文案库（引流-转化-复购-裂变全链路）
- ✅ 提供各场景高转化文案模板（社群、朋友圈、私聊、直播等）
- ✅ 设计用户分层的精准沟通策略
- ✅ 策划爆款内容和裂变活动
- ✅ 打造独特的IP人设和内容风格

**我的工作流程是这样的：**
1️⃣ **需求诊断** - 深入了解您的行业、产品、目标用户和核心痛点
2️⃣ **策略规划** - 为您制定私域文案体系框架和执行路径
3️⃣ **内容创作** - 提供可直接落地的文案模板和创意方案
4️⃣ **交付优化** - 结构化呈现成果并提供执行指导
5️⃣ **持续支持** - 根据反馈迭代优化，长期陪伴成长

现在，请告诉我：
- 您所在的**行业**和**产品类型**是什么？
- 您的**目标用户**是谁？
- 您目前在私域营销中遇到的**最大挑战**是什么？
- 您最希望我帮您解决的**具体需求**是什么？

期待与您合作，打造属于您的高转化私域文案体系！🚀`;

// 605: 私域客户回复助手
const PRIVATE_REPLY_WELCOME = `👋 你好!我是你的私域客户回复专业助手,拥有50年私域运营落地经验。

**我能帮你做什么:**
- 📝 为你撰写或优化客户回复话术
- 🎯 分析客户意图并制定沟通策略
- 💡 提供多种可选方案,每种都有明确目标
- 🔧 解决各类客户沟通场景难题
- 📊 提供系统化的私域运营建议

**我的工作流程:**
1. 你告诉我具体的客户对话内容或沟通场景
2. 我会分析客户状态和你的目标
3. 为你生成2-3种专业回复方案供选择
4. 每种方案都会说明策略重点和使用场景
5. 必要时提供后续跟进建议

现在,请告诉我你遇到的具体场景吧!你可以:
- 直接发送客户的对话截图或文字
- 描述你想解决的沟通问题
- 咨询某个场景的回复策略

我会立即为你提供专业的解决方案! 🚀`;

// 606: 私域社群活动策划
const PRIVATE_EVENT_WELCOME = `👋 您好!我是您的私域社群活动策划大师,拥有50年的项目落地经验。

**我的专长领域:**
- 🎯 私域战略规划与诊断
- 🎪 创新活动策划与执行
- 📊 数据驱动的运营优化
- 🛠️ 完整SOP与工具体系搭建

**我的工作流程:**
1. **深度诊断** - 了解您的业务现状和核心诉求
2. **方案设计** - 提供多套可选的策略方案
3. **执行落地** - 输出详细的SOP和工具模板
4. **持续优化** - 基于数据反馈迭代改进

**现在,请告诉我:**
- 您目前处于私域运营的哪个阶段?(刚起步/已有基础/需要突破)
- 您最想解决的核心问题是什么?(拉新/促活/转化/裂变)
- 您所在的行业和目标用户群体是?

让我们一起打造高效的私域运营体系! 🚀`;

// 607: 私域社群规则生成库
const PRIVATE_RULES_WELCOME = `👋 您好!我是**私域社群规则生成库大师**,拥有50年私域社群运营落地经验。

我可以帮您:
- ✅ 快速搭建完整的社群规则体系
- ✅ 生成可直接使用的规则模板和话术
- ✅ 定制符合您行业特点的管理方案
- ✅ 提供社群治理全流程工具文档
- ✅ 给出规则优化和迭代建议

**我的工作流程**:
1. 先了解您的社群类型、行业、目标用户等关键信息
2. 为您定制专属的社群规则生成方案
3. 输出完整的规则库和配套执行工具
4. 提供落地指导和后续优化建议

请告诉我:
- 您想搭建什么类型的私域社群?(如知识付费/电商/兴趣/企业内部等)
- 您的目标用户是谁?
- 您目前遇到的主要问题是什么?

让我们开始为您打造一套高效可落地的社群规则体系吧! 🚀`;

// 获取当前模板对应的欢迎消息
const getWelcomeMessage = (templateId: string): string => {
  switch (templateId) {
    case "601": return PRIVATE_DAILY_WELCOME;
    case "602": return PRIVATE_MOMENTS_WELCOME;
    case "603": return PRIVATE_VALUE_WELCOME;
    case "604": return PRIVATE_MARKETING_WELCOME;
    case "605": return PRIVATE_REPLY_WELCOME;
    case "606": return PRIVATE_EVENT_WELCOME;
    case "607": return PRIVATE_RULES_WELCOME;
    default: return PRIVATE_DAILY_WELCOME;
  }
};

// 获取当前模板对应的API端点
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "601": return "/api/private-daily";
    case "602": return "/api/private-moments";
    case "603": return "/api/private-value";
    case "604": return "/api/private-marketing";
    case "605": return "/api/private-reply";
    case "606": return "/api/private-event";
    case "607": return "/api/private-rules";
    default: return "/api/private-daily";
  }
};

// 根据模板ID获取对话类型
const getPrivateTypeByTemplateId = (templateId: number): PrivateType => {
  switch (templateId) {
    case 601: return "private-daily";
    case 602: return "private-moments";
    case 603: return "private-value";
    case 604: return "private-marketing";
    case 605: return "private-reply";
    case 606: return "private-event";
    case 607: return "private-rules";
    default: return "private-daily";
  }
};

function PrivateWritingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "私域日常文案库";
  const templateId = searchParams.get("template") || "601";
  const source = searchParams.get("source") || "media-private";

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
        const conversationType = getPrivateTypeByTemplateId(activeTemplate);
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
    const privateTemplateIds = ["601", "602", "603", "604", "605", "606", "607"];
    if (privateTemplateIds.includes(templateId) && messages.length === 0) {
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
          const conversationType = getPrivateTypeByTemplateId(activeTemplate);
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

    const privateTemplateIds = ["601", "602", "603", "604", "605", "606", "607"];
    if (privateTemplateIds.includes(templateId)) {
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
      {/* 私域运营模块：统一使用对话模式UI */}
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

export default function PrivateWritingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PrivateWritingPageContent />
    </Suspense>
  );
}








