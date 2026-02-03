# 小红书模块：对话历史与UI设计详解

> 深入讲解小红书模块的对话历史保存逻辑和对话式UI设计实现

## 📋 目录

1. [对话历史保存逻辑](#对话历史保存逻辑)
2. [对话式UI设计实现](#对话式ui设计实现)
3. [完整代码示例](#完整代码示例)

---

## 对话历史保存逻辑

### 1. 整体架构

小红书模块的对话历史系统采用三层架构：

```
前端组件层 (React)
    ↓
数据访问层 (lib/conversations.ts)
    ↓
数据库层 (Supabase PostgreSQL)
```

### 2. 数据库表设计

#### conversations 表（对话会话表）

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 子类型标识，如 'xiaohongshu-title'
  title TEXT,          -- 对话标题，自动生成或用户自定义
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 类型约束
  CONSTRAINT conversations_type_check CHECK (
    type IN (
      'xiaohongshu-copywriting',
      'xiaohongshu-title',
      'xiaohongshu-seo',
      'xiaohongshu-style',
      'xiaohongshu-product',
      'xiaohongshu-recommendation',
      'xiaohongshu-travel',
      'xiaohongshu-profile'
    )
  )
);

-- 索引优化
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
```

**关键点**：
- `type` 字段区分不同的小红书子类型
- `updated_at` 用于排序，最近使用的对话排在前面
- 级联删除：删除用户时自动删除其所有对话

#### messages 表（消息表）

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 可选字段：用于扩展
  metadata JSONB  -- 存储额外信息，如token使用量、模型版本等
);

-- 索引优化
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**关键点**：
- `role` 字段标识消息来源：user（用户）、assistant（AI）、system（系统）
- 级联删除：删除对话时自动删除其所有消息
- `metadata` 字段用于存储扩展信息

### 3. 数据访问层实现

#### 核心函数（lib/conversations.ts）

```typescript
import { supabase } from './supabase';

// ============================================
// 1. 创建新对话
// ============================================
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('创建对话失败:', error);
    throw error;
  }

  return data;
}

// ============================================
// 2. 获取用户的所有对话（按类型筛选）
// ============================================
export async function getConversations(
  userId: string,
  type?: string
): Promise<Conversation[]> {
  let query = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  // 如果指定了类型，只获取该类型的对话
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('获取对话列表失败:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// 3. 添加消息到对话
// ============================================
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
): Promise<Message> {
  // 1. 插入消息
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: role,
      content: content,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (messageError) {
    console.error('添加消息失败:', messageError);
    throw messageError;
  }

  // 2. 更新对话的 updated_at 时间戳
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  if (updateError) {
    console.error('更新对话时间戳失败:', updateError);
  }

  return message;
}

// ============================================
// 4. 获取对话的所有消息
// ============================================
export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('获取消息列表失败:', error);
    throw error;
  }

  return data || [];
}

// ============================================
// 5. 删除对话（级联删除所有消息）
// ============================================
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('删除对话失败:', error);
    throw error;
  }
}

// ============================================
// 6. 更新对话标题
// ============================================
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .update({ title: title })
    .eq('id', conversationId);

  if (error) {
    console.error('更新对话标题失败:', error);
    throw error;
  }
}

// ============================================
// 7. 根据子类型获取对应的类型标识
// ============================================
export function getXiaohongshuTypeByTemplateId(templateId: number): string {
  const typeMap: Record<number, string> = {
    101: 'xiaohongshu-travel',        // 旅游攻略
    102: 'xiaohongshu-copywriting',   // 爆款文案
    103: 'xiaohongshu-title',         // 爆款标题
    104: 'xiaohongshu-profile',       // 账号简介
    105: 'xiaohongshu-seo',           // SEO优化
    106: 'xiaohongshu-style',         // 风格改写
    107: 'xiaohongshu-product',       // 产品种草
    108: 'xiaohongshu-recommendation', // 好物推荐
  };

  return typeMap[templateId] || 'xiaohongshu-copywriting';
}
```

### 4. 前端状态管理

#### 组件内状态设计

```typescript
// components/xiaohongshu-writing-page.tsx

export default function XiaohongshuWritingPage() {
  // ============================================
  // 状态定义
  // ============================================

  // 当前选中的对话
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // 对话列表
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // 消息列表（当前对话的所有消息）
  const [messages, setMessages] = useState<Message[]>([]);

  // 对话历史（用于传递给API）
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);

  // 当前选中的子类型
  const [selectedType, setSelectedType] = useState<number>(103); // 默认：爆款标题

  // 用户输入
  const [userInput, setUserInput] = useState('');

  // 加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 用户信息
  const [user, setUser] = useState<User | null>(null);

  // ============================================
  // 初始化：加载用户和对话列表
  // ============================================
  useEffect(() => {
    async function init() {
      // 1. 获取当前用户
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // 2. 加载对话列表（按当前子类型筛选）
        await loadConversations(user.id);
      }
    }

    init();
  }, []);

  // ============================================
  // 加载对话列表
  // ============================================
  async function loadConversations(userId: string) {
    try {
      // 获取当前子类型对应的type标识
      const type = getXiaohongshuTypeByTemplateId(selectedType);

      // 从数据库获取对话列表
      const convs = await getConversations(userId, type);
      setConversations(convs);

      // 如果有对话，默认选中第一个
      if (convs.length > 0 && !currentConversation) {
        setCurrentConversation(convs[0]);
      }
    } catch (error) {
      console.error('加载对话列表失败:', error);
    }
  }

  // ============================================
  // 切换子类型时重新加载对话列表
  // ============================================
  useEffect(() => {
    if (user) {
      loadConversations(user.id);
      // 清空当前对话和消息
      setCurrentConversation(null);
      setMessages([]);
      setConversationHistory([]);
    }
  }, [selectedType]);

  // ============================================
  // 加载对话的消息历史
  // ============================================
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  async function loadMessages(conversationId: string) {
    try {
      // 1. 从数据库获取消息列表
      const msgs = await getConversationMessages(conversationId);
      setMessages(msgs);

      // 2. 构建API所需的对话历史格式
      // 过滤掉system消息，只保留user和assistant的对话
      const history = msgs
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      setConversationHistory(history);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  }

  // ============================================
  // 创建新对话
  // ============================================
  async function handleNewConversation() {
    if (!user) return;

    try {
      // 1. 获取当前子类型对应的type标识
      const type = getXiaohongshuTypeByTemplateId(selectedType);

      // 2. 创建新对话
      const newConv = await createConversation(
        user.id,
        type,
        '新对话'
      );

      // 3. 更新状态
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
      setConversationHistory([]);

      // 4. 添加AI的欢迎消息
      await addWelcomeMessage(newConv.id);
    } catch (error) {
      console.error('创建对话失败:', error);
    }
  }

  // ============================================
  // 添加AI欢迎消息
  // ============================================
  async function addWelcomeMessage(conversationId: string) {
    // 根据子类型获取对应的欢迎语
    const welcomeMessage = getWelcomeMessageByType(selectedType);

    // 保存到数据库
    const message = await addMessage(
      conversationId,
      'assistant',
      welcomeMessage
    );

    // 更新UI
    setMessages([message]);
  }

  // ============================================
  // 发送消息
  // ============================================
  async function handleSendMessage() {
    if (!userInput.trim() || !currentConversation || !user) return;

    setIsLoading(true);

    try {
      // 1. 保存用户消息到数据库
      const userMessage = await addMessage(
        currentConversation.id,
        'user',
        userInput
      );

      // 2. 更新UI（立即显示用户消息）
      setMessages(prev => [...prev, userMessage]);

      // 3. 调用AI API
      const apiEndpoint = getApiEndpointByType(selectedType);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userInput,
          conversationHistory: conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 4. 保存AI回复到数据库
        const aiMessage = await addMessage(
          currentConversation.id,
          'assistant',
          data.result,
          { usage: data.usage } // 保存token使用量等元数据
        );

        // 5. 更新UI
        setMessages(prev => [...prev, aiMessage]);

        // 6. 更新对话历史（用于下次API调用）
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: userInput },
          { role: 'assistant', content: data.result },
        ]);
      }

      // 7. 清空输入框
      setUserInput('');
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // ============================================
  // 删除对话
  // ============================================
  async function handleDeleteConversation(conversationId: string) {
    try {
      await deleteConversation(conversationId);

      // 更新UI
      setConversations(prev => prev.filter(c => c.id !== conversationId));

      // 如果删除的是当前对话，清空选中状态
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
        setConversationHistory([]);
      }
    } catch (error) {
      console.error('删除对话失败:', error);
    }
  }

  // ... 渲染UI
}
```

### 5. 关键流程图

#### 新建对话流程

```
用户点击"新建对话"
    ↓
调用 createConversation()
    ↓
在数据库创建新记录
    ↓
更新前端对话列表
    ↓
设置为当前对话
    ↓
添加AI欢迎消息
    ↓
保存欢迎消息到数据库
    ↓
显示在UI上
```

#### 发送消息流程

```
用户输入消息并发送
    ↓
保存用户消息到数据库
    ↓
立即显示在UI上
    ↓
调用AI API（传入对话历史）
    ↓
接收AI回复
    ↓
保存AI消息到数据库
    ↓
显示在UI上
    ↓
更新对话历史数组
```

#### 切换对话流程

```
用户点击对话列表中的某个对话
    ↓
设置为当前对话
    ↓
从数据库加载该对话的所有消息
    ↓
构建对话历史数组
    ↓
渲染消息列表
```

---

## 对话式UI设计实现

### 1. 整体布局结构

```tsx
<div className="flex h-screen bg-gray-50">
  {/* 左侧：对话列表 */}
  <aside className="w-64 bg-white border-r border-gray-200">
    <ConversationList />
  </aside>

  {/* 中间：对话区域 */}
  <main className="flex-1 flex flex-col">
    {/* 顶部：子类型选择器 + 操作按钮 */}
    <header className="h-16 bg-white border-b border-gray-200">
      <SubtypeSelector />
    </header>

    {/* 中间：消息列表 */}
    <ScrollArea className="flex-1 p-4">
      <MessageList />
    </ScrollArea>

    {/* 底部：输入框 */}
    <footer className="p-4 bg-white border-t border-gray-200">
      <MessageInput />
    </footer>
  </main>

  {/* 右侧：结果展示/编辑器（可选） */}
  <aside className="w-96 bg-white border-l border-gray-200">
    <ResultEditor />
  </aside>
</div>
```

### 2. 对话列表组件

```tsx
function ConversationList() {
  return (
    <div className="flex flex-col h-full">
      {/* 顶部：新建对话按钮 */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={handleNewConversation}
          className="w-full"
          variant="default"
        >
          <Plus className="w-4 h-4 mr-2" />
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => setCurrentConversation(conversation)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-colors",
                "hover:bg-gray-100",
                currentConversation?.id === conversation.id
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-white"
              )}
            >
              {/* 对话标题 */}
              <div className="font-medium text-sm truncate">
                {conversation.title}
              </div>

              {/* 时间戳 */}
              <div className="text-xs text-gray-500 mt-1">
                {formatTime(conversation.updated_at)}
              </div>

              {/* 删除按钮 */}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conversation.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

### 3. 消息列表组件

```tsx
function MessageList() {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
```

### 4. 消息气泡组件

```tsx
function MessageBubble({ message, isLast }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI头像 */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      )}

      {/* 消息内容 */}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-blue-500 text-white"
            : "bg-white border border-gray-200"
        )}
      >
        {/* Markdown渲染 */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* 时间戳 */}
        <div
          className={cn(
            "text-xs mt-2",
            isUser ? "text-blue-100" : "text-gray-400"
          )}
        >
          {formatTime(message.created_at)}
        </div>

        {/* 操作按钮（仅AI消息） */}
        {!isUser && isLast && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(message.content)}
            >
              <Copy className="w-3 h-3 mr-1" />
              复制
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRegenerate()}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              重新生成
            </Button>
          </div>
        )}
      </div>

      {/* 用户头像 */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-medium">U</span>
        </div>
      )}
    </div>
  );
}
```

### 5. 输入框组件

```tsx
function MessageInput() {
  return (
    <div className="flex gap-2">
      {/* 文本输入框 */}
      <Textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        placeholder="输入你的需求... (Enter发送，Shift+Enter换行)"
        className="flex-1 min-h-[60px] max-h-[200px] resize-none"
      />

      {/* 发送按钮 */}
      <Button
        onClick={handleSendMessage}
        disabled={!userInput.trim() || isLoading}
        className="self-end"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
```

### 6. 子类型选择器

```tsx
function SubtypeSelector() {
  const subtypes = [
    { id: 101, title: '旅游攻略', icon: '🗺️' },
    { id: 102, title: '爆款文案', icon: '✍️' },
    { id: 103, title: '爆款标题', icon: '🎯' },
    { id: 104, title: '账号简介', icon: '👤' },
    { id: 105, title: 'SEO优化', icon: '🔍' },
    { id: 106, title: '风格改写', icon: '🎨' },
    { id: 107, title: '产品种草', icon: '🛍️' },
    { id: 108, title: '好物推荐', icon: '⭐' },
  ];

  return (
    <div className="flex items-center justify-between h-full px-4">
      {/* 左侧：子类型选择 */}
      <Select
        value={selectedType.toString()}
        onValueChange={(value) => setSelectedType(Number(value))}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {subtypes.map(type => (
            <SelectItem key={type.id} value={type.id.toString()}>
              <span className="mr-2">{type.icon}</span>
              {type.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 右侧：操作按钮 */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Save className="w-4 h-4 mr-2" />
          保存
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          分享
        </Button>
      </div>
    </div>
  );
}
```

---

## 完整代码示例

### 完整的组件代码

由于代码较长，这里提供核心部分的完整实现。完整代码请参考：
- [components/xiaohongshu-writing-page.tsx](../components/xiaohongshu-writing-page.tsx)
- [lib/conversations.ts](../lib/conversations.ts)

### 关键技术点总结

1. **状态管理**
   - 使用React Hooks管理组件状态
   - 分离UI状态和数据状态
   - 使用useEffect处理副作用

2. **数据持久化**
   - 所有对话和消息都保存到Supabase
   - 实时同步前端状态和数据库
   - 支持离线缓存（可选）

3. **性能优化**
   - 消息列表虚拟滚动（大量消息时）
   - 对话列表分页加载
   - 防抖输入处理

4. **用户体验**
   - 自动滚动到最新消息
   - 加载状态提示
   - 错误处理和重试机制
   - 快捷键支持（Enter发送）

---

**文档版本**: v1.0
**最后更新**: 2026-02-04
**维护者**: 开发团队
