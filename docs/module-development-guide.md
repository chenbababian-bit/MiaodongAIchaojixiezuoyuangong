# 内容创作模块开发指南

> 基于小红书模块的完整制作流程，适用于公众号、今日头条等其他平台模块的快速开发

## 📋 目录

1. [整体架构](#整体架构)
2. [前端UI组件结构](#前端ui组件结构)
3. [对话历史功能实现](#对话历史功能实现)
4. [API路由设计](#api路由设计)
5. [数据库设计](#数据库设计)
6. [快速复用指南](#快速复用指南)
7. [开发检查清单](#开发检查清单)

---

## 整体架构

### 技术栈
- **前端框架**: Next.js 14 (App Router)
- **UI组件库**: shadcn/ui + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **AI服务**: DeepSeek API
- **状态管理**: React Hooks (useState, useEffect)

### 模块组成
```
模块名称/
├── 前端组件 (components/)
│   └── [module]-writing-page.tsx
├── API路由 (app/api/)
│   ├── [module]/route.ts (主功能)
│   ├── [module]-[subtype1]/route.ts
│   ├── [module]-[subtype2]/route.ts
│   └── ...
├── 数据库迁移 (supabase/migrations/)
│   └── [date]_add_[module]_type.sql
└── 模板配置 (lib/)
    └── template-config.ts
```

---

## 前端UI组件结构

### 1. 对话模式UI设计

小红书模块采用统一的对话模式UI，包含以下核心元素：

#### 布局结构

```tsx
<div className="flex h-screen">
  {/* 左侧：历史对话列表 */}
  <aside className="w-64 border-r">
    <ConversationList />
  </aside>

  {/* 中间：对话区域 */}
  <main className="flex-1 flex flex-col">
    {/* 顶部：子类型选择器 */}
    <header>
      <SubtypeSelector />
    </header>

    {/* 中间：消息列表 */}
    <ScrollArea className="flex-1">
      <MessageList />
    </ScrollArea>

    {/* 底部：输入框 */}
    <footer>
      <MessageInput />
    </footer>
  </main>

  {/* 右侧：结果展示/编辑器 */}
  <aside className="w-96 border-l">
    <ResultEditor />
  </aside>
</div>
```

#### 核心组件说明

##### 1. 子类型选择器 (SubtypeSelector)
```tsx
// 位置：顶部导航栏
// 功能：切换不同的AI功能子类型
<Select value={selectedType} onValueChange={handleTypeChange}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {subtypes.map(type => (
      <SelectItem key={type.id} value={type.id}>
        {type.icon} {type.title}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**关键点**：
- 每个子类型对应一个独立的API路由
- 切换子类型时保留当前对话历史
- 子类型配置在 `lib/template-config.ts` 中统一管理

##### 2. 消息气泡组件 (MessageBubble)
```tsx
// 位置：components/message-bubble.tsx
// 功能：展示用户和AI的对话消息

<MessageBubble
  role="user" | "assistant"
  content={message.content}
  timestamp={message.timestamp}
/>
```

**样式规范**：
- 用户消息：右对齐，蓝色背景
- AI消息：左对齐，灰色背景
- 支持Markdown渲染
- 支持代码高亮

##### 3. 历史对话列表 (ConversationList)
```tsx
// 功能：展示和管理历史对话
- 新建对话按钮
- 对话列表（按时间倒序）
- 删除对话功能
- 对话标题自动生成
```

**数据流**：
```
用户点击对话 → 加载对话历史 → 渲染消息列表 → 恢复上下文
```

---

## 对话历史功能实现

### 1. 数据库表结构

#### conversations 表
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,  -- 模块类型标识
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT conversations_type_check CHECK (
    type IN (
      'xiaohongshu-copywriting',
      'xiaohongshu-title',
      'xiaohongshu-seo',
      'xiaohongshu-style',
      -- 其他模块类型...
    )
  )
);
```

#### messages 表
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. 核心函数实现

#### 创建对话
```typescript
// lib/conversations.ts
export async function createConversation(
  userId: string,
  type: string,
  title?: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      type: type,
      title: title || '新对话',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

#### 添加消息
```typescript
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: role,
      content: content,
    })
    .select()
    .single();

  if (error) throw error;

  // 更新对话的 updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}
```

#### 获取对话历史
```typescript
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}
```

### 3. 前端状态管理

```typescript
// 组件内状态
const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
const [messages, setMessages] = useState<Message[]>([]);
const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
const [historyConversations, setHistoryConversations] = useState<DBConversation[]>([]);
const [isLoadingHistory, setIsLoadingHistory] = useState(false);
const [resultTab, setResultTab] = useState<"current" | "history">("current");

// 加载对话历史列表
useEffect(() => {
  const loadHistory = async () => {
    if (!userId) return;

    setIsLoadingHistory(true);
    try {
      const conversationType = getModuleTypeByTemplateId(templateId);
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

// 加载单个对话的消息
async function loadMessages(conversationId: string) {
  const msgs = await getConversationMessages(conversationId);
  setMessages(msgs);

  // 构建API所需的对话历史格式
  const history = msgs.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
  setConversationHistory(history);
}
```

### 4. 历史记录UI实现

#### 4.1 历史记录标签页切换

```typescript
// 右侧区域：当前创作结果 / 历史记录
<div className="flex-1 flex flex-col">
  {/* 标签页切换按钮 */}
  <div className="flex gap-2 p-4 border-b">
    <Button
      variant={resultTab === "current" ? "default" : "outline"}
      onClick={() => setResultTab("current")}
    >
      当前创作结果
    </Button>
    <Button
      variant={resultTab === "history" ? "default" : "outline"}
      onClick={() => setResultTab("history")}
    >
      历史记录
    </Button>
  </div>

  {/* 内容区域 */}
  {resultTab === "current" ? (
    <RichTextEditor value={currentResult} />
  ) : (
    <HistoryList />
  )}
</div>
```

#### 4.2 历史记录列表展示

```typescript
// 历史记录列表组件
function HistoryList() {
  return (
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
              onClick={() => handleLoadConversation(conversation.id)}
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
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
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
  );
}
```

#### 4.3 点击历史记录恢复对话

```typescript
// 加载历史对话的完整实现
async function handleLoadConversation(conversationId: string) {
  try {
    const { getConversationWithMessages } = await import('@/lib/conversations');
    const conv = await getConversationWithMessages(conversationId);

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

      // 更新状态
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
}
```

#### 4.4 新建对话功能

```typescript
// 新建对话按钮
<Button
  variant="outline"
  size="sm"
  onClick={handleNewConversation}
  className="gap-2"
>
  <Plus className="h-4 w-4" />
  新建对话
</Button>

// 新建对话处理函数
function handleNewConversation() {
  // 清空当前对话状态
  setCurrentConversationId(null);
  setMessages([]);
  setConversationHistory([]);
  setCurrentResult('');

  // 重置为欢迎消息
  setMessages([{
    id: 'welcome',
    role: 'assistant',
    content: getWelcomeMessage(templateId),
    isCollapsed: false
  }]);

  // 切换到当前创作结果标签
  setResultTab('current');
}
```

### 5. 自动保存对话

```typescript
// 发送消息后自动保存到数据库
async function handleSendMessage(userContent: string) {
  // ... 调用AI API获取回复 ...

  // 更新对话历史状态
  setConversationHistory(prev => [
    ...prev,
    { role: 'user', content: userContent },
    { role: 'assistant', content: aiResponse }
  ]);

  // 如果用户已登录且没有当前对话ID，自动创建对话并保存
  if (userId && !currentConversationId) {
    try {
      const title = userContent.slice(0, 30) + (userContent.length > 30 ? '...' : '');
      const conversationType = getModuleTypeByTemplateId(templateId);
      const convId = await createConversation(userId, title, conversationType);
      setCurrentConversationId(convId);

      // 保存消息到数据库
      await addMessage(convId, 'user', userContent);
      await addMessage(convId, 'assistant', aiResponse);

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
      await addMessage(currentConversationId, 'assistant', aiResponse);
    } catch (dbError) {
      console.error('保存消息失败:', dbError);
    }
  }
}
```

### 6. 类型映射函数

```typescript
// lib/conversations.ts
// 根据模板ID获取对应的对话类型
export function getXiaohongshuTypeByTemplateId(templateId: number): XiaohongshuType {
  const templateMap: Record<number, XiaohongshuType> = {
    // 新ID (101-108)
    101: 'xiaohongshu-travel',
    102: 'xiaohongshu-copywriting',
    103: 'xiaohongshu-title',
    104: 'xiaohongshu-profile',
    105: 'xiaohongshu-seo',
    106: 'xiaohongshu-style',
    107: 'xiaohongshu-product',
    108: 'xiaohongshu-recommendation',
    // 旧ID (1-8) - 向后兼容
    1: 'xiaohongshu-travel',
    2: 'xiaohongshu-copywriting',
    3: 'xiaohongshu-title',
    4: 'xiaohongshu-profile',
    5: 'xiaohongshu-seo',
    6: 'xiaohongshu-style',
    7: 'xiaohongshu-product',
    8: 'xiaohongshu-recommendation',
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的模板ID: ${templateId}，使用默认类型`);
    return 'xiaohongshu-copywriting';
  }

  return type;
}

// 其他模块的类型映射函数
export function getWeiboTypeByTemplateId(templateId: number): WeiboType { /* ... */ }
export function getZhihuTypeByTemplateId(templateId: number): ZhihuType { /* ... */ }
export function getWechatTypeByTemplateId(templateId: number): WechatType { /* ... */ }
export function getToutiaoTypeByTemplateId(templateId: number): ToutiaoType { /* ... */ }
```

---

## API路由设计

### 1. 标准API结构

每个子类型对应一个独立的API路由文件：

```typescript
// app/api/[module]-[subtype]/route.ts

import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// SYSTEM_PROMPT：定义AI角色和行为
const SYSTEM_PROMPT = `
# 角色定义
你是一个专业的[功能描述]专家...

## 技能
- 技能1
- 技能2

## 规则
- 规则1
- 规则2

## 工作流程
1. 步骤1
2. 步骤2

## 初始化
[欢迎语]
`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    // 验证输入
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容" },
        { status: 400 }
      );
    }

    // 验证 API Key
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "服务器配置错误" },
        { status: 500 }
      );
    }

    // 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      // 构建消息数组
      const messages = [
        { role: "system", content: SYSTEM_PROMPT }
      ];

      // 添加对话历史
      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      // 添加当前用户消息
      messages.push({
        role: "user",
        content: content,
      });

      // 调用AI API
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.8,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `AI 服务错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        result: result,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "请求超时" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
```

### 2. SYSTEM_PROMPT 设计规范

#### 基本结构
```markdown
# 角色定义
明确AI的身份和专业领域

## Profile
- author: 作者
- version: 版本
- language: 语言
- description: 描述

## Background
说明用户痛点和需求背景

## Goals
列出AI要达成的目标

## Constrains
约束条件和禁止事项

## Skills
AI具备的专业技能

## Rules
工作规则和输出规范

## Workflow
工作流程步骤

## Initialization
初始化欢迎语（纯文本，无emoji和markdown格式）
```

#### 关键要点
1. **欢迎语格式**：使用纯文本，不包含emoji和markdown加粗
2. **对话历史支持**：通过 `conversationHistory` 参数传递
3. **错误处理**：完善的超时和异常处理机制
4. **响应格式**：统一的JSON响应结构

---

## 数据库设计

### 1. 添加新模块类型

当添加新模块（如公众号、今日头条）时，需要更新数据库约束：

```sql
-- supabase/migrations/[date]_add_[module]_type.sql

-- 删除旧的 CHECK 约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

-- 添加新的 CHECK 约束
ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN (
  -- 小红书模块
  'xiaohongshu-copywriting',
  'xiaohongshu-title',
  'xiaohongshu-seo',
  'xiaohongshu-style',
  'xiaohongshu-product',
  'xiaohongshu-recommendation',
  'xiaohongshu-travel',
  'xiaohongshu-profile',

  -- 公众号模块（新增）
  'wechat-article',
  'wechat-title',
  'wechat-opening',

  -- 今日头条模块（新增）
  'toutiao-article',
  'toutiao-title',

  -- 其他模块
  'qa',
  'role'
));
```

### 2. 类型命名规范

```
[平台名称]-[功能类型]

示例：
- xiaohongshu-copywriting  (小红书-爆款文案)
- wechat-article          (公众号-文章撰写)
- toutiao-title           (今日头条-标题创作)
```

---

## 快速复用指南

### 步骤1：定义模块配置

在 `lib/template-config.ts` 中添加新模块配置：

```typescript
export const wechatTemplates = [
  {
    id: 'wechat-article',
    title: '公众号文章撰写',
    description: '创作高质量的公众号文章',
    icon: FileText,
    apiEndpoint: '/api/wechat-article',
  },
  {
    id: 'wechat-title',
    title: '公众号标题优化',
    description: '打造10w+爆款标题',
    icon: PenTool,
    apiEndpoint: '/api/wechat-title',
  },
  // 更多子类型...
];
```

### 步骤2：创建API路由

复制小红书模块的API文件作为模板：

```bash
# 复制模板文件
cp app/api/xiaohongshu/route.ts app/api/wechat-article/route.ts

# 修改以下内容：
# 1. SYSTEM_PROMPT（定义新的AI角色）
# 2. 验证逻辑（根据需求调整）
# 3. 参数处理（如有特殊参数）
```

### 步骤3：创建前端组件

复制并修改小红书组件：

```bash
cp components/xiaohongshu-writing-page.tsx components/wechat-writing-page.tsx
```

需要修改的部分：
1. **子类型列表**：更新为新模块的子类型
2. **API调用**：更新API端点
3. **UI文案**：更新标题、描述等文案
4. **图标和颜色**：更新视觉元素

### 步骤4：更新数据库

运行数据库迁移脚本：

```sql
-- 添加新模块类型到约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN (
  -- 现有类型...
  'wechat-article',
  'wechat-title'
  -- 新增类型
));
```

### 步骤5：添加路由

在 `app/writing/[module]/page.tsx` 中添加新路由：

```typescript
// app/writing/wechat/page.tsx
import WechatWritingPage from '@/components/wechat-writing-page';

export default function WechatPage() {
  return <WechatWritingPage />;
}
```

---

## 开发检查清单

### 前端开发
- [ ] 创建组件文件 `components/[module]-writing-page.tsx`
- [ ] 配置子类型列表和图标
- [ ] 实现对话历史加载逻辑
- [ ] 实现消息发送和接收
- [ ] 添加加载状态和错误处理
- [ ] 实现结果复制和保存功能
- [ ] 测试UI响应式布局

### 后端开发
- [ ] 创建API路由文件 `app/api/[module]-[subtype]/route.ts`
- [ ] 编写SYSTEM_PROMPT（遵循格式规范）
- [ ] 实现请求验证逻辑
- [ ] 添加超时控制机制
- [ ] 实现对话历史支持
- [ ] 添加错误处理和日志
- [ ] 测试API响应时间和稳定性

### 数据库
- [ ] 创建迁移脚本 `supabase/migrations/[date]_add_[module]_type.sql`
- [ ] 更新 conversations 表约束
- [ ] 测试类型约束是否生效
- [ ] 验证数据插入和查询

### 配置文件
- [ ] 更新 `lib/template-config.ts` 添加模块配置
- [ ] 更新 `lib/conversations.ts` 添加类型映射
- [ ] 更新路由配置

### 测试
- [ ] 测试新建对话功能
- [ ] 测试对话历史加载
- [ ] 测试消息发送和接收
- [ ] 测试子类型切换
- [ ] 测试错误场景处理
- [ ] 测试并发请求处理

---

## 常见问题

### Q1: 如何处理对话历史过长的问题？
A: 可以在API层面实现历史消息截断：
```typescript
// 只保留最近10轮对话
const recentHistory = conversationHistory.slice(-20); // 10轮 = 20条消息
```

### Q2: 如何实现流式响应？
A: 使用Server-Sent Events (SSE)：
```typescript
// API路由中
const stream = new ReadableStream({
  async start(controller) {
    // 流式发送数据
  }
});
return new Response(stream);
```

### Q3: 如何优化API响应速度？
A:
1. 使用更快的AI模型
2. 减少SYSTEM_PROMPT长度
3. 限制对话历史长度
4. 实现请求缓存机制

---

## 总结

通过遵循本指南，你可以快速复用小红书模块的架构，开发出功能完整、体验一致的新内容创作模块。

核心要点：
1. **统一的对话模式UI** - 保持用户体验一致性
2. **标准化的API设计** - 便于维护和扩展
3. **完善的对话历史** - 提升AI交互质量
4. **模块化的配置管理** - 降低开发复杂度

---

**文档版本**: v1.0
**最后更新**: 2026-02-04
**维护者**: 开发团队
