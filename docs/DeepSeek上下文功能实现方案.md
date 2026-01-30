# DeepSeek 上下文功能实现方案

## 📋 问题分析

### 当前实现的问题

当前的公众号文章撰写功能**不支持真正的上下文对话**，存在以下问题：

```typescript
// ❌ 当前实现（无上下文）
interface OfficialAccountArticleRequest {
  content: string;
  followUpQuestion?: string;
}

// 只是简单拼接
let userMessage = content;
if (followUpQuestion) {
  userMessage += `\n\n追加要求：${followUpQuestion}`;
}

// 只发送一条消息
messages: [
  { role: "system", content: SYSTEM_PROMPT },
  { role: "user", content: userMessage }
]
```

**问题：**
1. ❌ AI 看不到之前生成的内容
2. ❌ 用户追问"能不能针对第4部分补充更多具体步骤？"时，AI 不知道"第4部分"是什么
3. ❌ 每次都是全新的对话，无法基于之前的内容进行优化

---

## ✅ DeepSeek API 支持的上下文功能

DeepSeek API **完全支持多轮对话**，只需要传入完整的对话历史：

```typescript
messages: [
  { role: "system", content: "系统提示词" },
  { role: "user", content: "如何从零开始养成早起习惯" },
  { role: "assistant", content: "【AI生成的完整大纲】" },
  { role: "user", content: "能不能针对第4部分补充更多具体步骤？" },
  { role: "assistant", content: "【基于之前大纲的优化版本】" },
  // 可以继续多轮对话...
]
```

---

## 🛠️ 完整实现方案

### 方案一：简单实现（推荐）

#### 1. 修改 API 接口定义

```typescript
// app/api/official-account-article/route.ts

// 消息类型定义
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// 请求数据接口
interface OfficialAccountArticleRequest {
  content: string; // 用户当前输入
  conversationHistory?: Message[]; // 对话历史（可选）
}
```

#### 2. 修改 API 处理逻辑

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory }: OfficialAccountArticleRequest = body;

    // 验证必填字段
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入您想要撰写的文章主题" },
        { status: 400 }
      );
    }

    // 构建消息数组
    let messages: Message[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      }
    ];

    // 如果有对话历史，添加到消息数组
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages = messages.concat(conversationHistory);
    }

    // 添加当前用户消息
    messages.push({
      role: "user",
      content: content,
    });

    console.log("对话历史长度:", conversationHistory?.length || 0);
    console.log("总消息数:", messages.length);

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages, // 传入完整的对话历史
        temperature: 0.8,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    // ... 其余代码保持不变
  }
}
```

#### 3. 修改前端组件

```typescript
// components/xiaohongshu-writing-page.tsx

// 添加对话历史状态
const [conversationHistory, setConversationHistory] = useState<
  Array<{ role: "user" | "assistant"; content: string }>
>([]);

// 修改提交函数
const handleSubmit = async () => {
  // ... 表单验证代码 ...

  setIsLoading(true);
  setError("");
  setResultTab("current");

  try {
    let apiEndpoint = "/api/official-account-article";
    let requestBody: any = {};

    if (templateId === "109") {
      // 公众号文章专用API
      requestBody = {
        content: articleTheme,
        conversationHistory: conversationHistory, // 传递对话历史
      };
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // ... 响应处理代码 ...

    if (!data.result) {
      throw new Error("AI返回结果为空，请重试");
    }

    setCurrentResult(data.result);

    // 更新对话历史
    setConversationHistory([
      ...conversationHistory,
      { role: "user", content: articleTheme },
      { role: "assistant", content: data.result },
    ]);

    // 清空当前输入，准备下一次追问
    setArticleTheme("");

    // ... 其余代码保持不变
  } catch (error) {
    // ... 错误处理代码 ...
  } finally {
    setIsLoading(false);
  }
};

// 添加清空对话历史的按钮
const handleClearHistory = () => {
  setConversationHistory([]);
  setCurrentResult("");
  setArticleTheme("");
  setArticleFollowUp("");
};
```

#### 4. 添加对话历史显示和管理

```typescript
{/* 对话历史管理 */}
{templateId === "109" && conversationHistory.length > 0 && (
  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        💬 对话历史 ({conversationHistory.length / 2} 轮)
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClearHistory}
        className="text-red-500 hover:text-red-600"
      >
        <X className="h-4 w-4 mr-1" />
        清空历史
      </Button>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      AI 会基于完整的对话历史进行回答，确保上下文连贯
    </p>
  </div>
)}
```

---

### 方案二：高级实现（带历史记录持久化）

如果需要在页面刷新后仍然保持对话历史，可以使用 localStorage：

```typescript
// 保存对话历史到 localStorage
useEffect(() => {
  if (conversationHistory.length > 0) {
    localStorage.setItem(
      `conversation_${templateId}`,
      JSON.stringify(conversationHistory)
    );
  }
}, [conversationHistory, templateId]);

// 从 localStorage 加载对话历史
useEffect(() => {
  const saved = localStorage.getItem(`conversation_${templateId}`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setConversationHistory(parsed);
    } catch (error) {
      console.error("加载对话历史失败:", error);
    }
  }
}, [templateId]);
```

---

## 📊 实现效果对比

### ❌ 修改前（无上下文）

```
用户: 如何从零开始养成早起习惯
AI: 【生成完整大纲】

用户: 能不能针对第4部分补充更多具体步骤？
AI: ❌ 不知道"第4部分"是什么，只能重新生成
```

### ✅ 修改后（有上下文）

```
用户: 如何从零开始养成早起习惯
AI: 【生成完整大纲】
    1. 开头：痛点与钩子
    2. 核心概念：认知重塑
    3. 执行前奏：宏观策略
    4. 核心实操：微观战术 ← 这是第4部分
    ...

用户: 能不能针对第4部分补充更多具体步骤？
AI: ✅ 知道第4部分是"核心实操：微观战术"
    ✅ 基于之前的大纲进行补充和优化
    ✅ 保持整体结构的一致性
```

---

## 🎯 使用场景

### 典型对话流程

1. **第一轮：生成初始大纲**
   ```
   用户: 如何从零开始养成早起习惯
   AI: 【生成完整的七步框架大纲】
   ```

2. **第二轮：针对性优化**
   ```
   用户: 能不能针对第4部分补充更多具体步骤？
   AI: 【基于之前大纲，详细展开第4部分】
   ```

3. **第三轮：增加案例**
   ```
   用户: 可以增加一些成功案例吗？
   AI: 【在第5部分增加更多案例】
   ```

4. **第四轮：调整风格**
   ```
   用户: 能不能让语气更轻松一些？
   AI: 【保持结构，调整语气】
   ```

---

## ⚠️ 注意事项

### 1. Token 限制

DeepSeek API 有 token 限制（通常是 4000-8000 tokens），对话历史过长可能会超出限制。

**解决方案：**
- 限制对话历史的轮数（例如：最多保留最近 5 轮对话）
- 或者提供"清空历史"按钮，让用户手动清空

```typescript
// 限制对话历史长度
const MAX_HISTORY_ROUNDS = 5; // 最多保留5轮对话（10条消息）

const addToHistory = (userMsg: string, assistantMsg: string) => {
  const newHistory = [
    ...conversationHistory,
    { role: "user", content: userMsg },
    { role: "assistant", content: assistantMsg },
  ];

  // 如果超过限制，删除最早的对话
  if (newHistory.length > MAX_HISTORY_ROUNDS * 2) {
    newHistory.splice(0, 2); // 删除最早的一轮对话（用户+助手）
  }

  setConversationHistory(newHistory);
};
```

### 2. 性能考虑

对话历史越长，API 调用的成本越高（消耗更多 tokens）。

**建议：**
- 在 UI 上显示当前对话轮数
- 提供"开始新对话"按钮
- 在对话历史较长时提示用户

### 3. 用户体验

**建议添加的 UI 元素：**
- 对话历史轮数显示
- 清空历史按钮
- 对话历史预览（可折叠）
- 当前对话状态指示

---

## 🚀 快速实施步骤

### 步骤 1：修改 API 接口（5分钟）

1. 打开 `app/api/official-account-article/route.ts`
2. 修改接口定义，添加 `conversationHistory` 字段
3. 修改消息构建逻辑，包含对话历史

### 步骤 2：修改前端组件（10分钟）

1. 打开 `components/xiaohongshu-writing-page.tsx`
2. 添加 `conversationHistory` 状态
3. 修改 `handleSubmit` 函数，传递对话历史
4. 在成功后更新对话历史

### 步骤 3：添加 UI 元素（5分钟）

1. 添加对话历史显示
2. 添加清空历史按钮
3. 添加对话轮数提示

### 步骤 4：测试（5分钟）

1. 生成初始大纲
2. 进行追问测试
3. 验证 AI 是否能理解上下文
4. 测试清空历史功能

---

## 📝 总结

**DeepSeek 完全支持上下文功能！** 只需要：

1. ✅ 在前端保存对话历史
2. ✅ 在 API 调用时传递完整的对话历史
3. ✅ DeepSeek 会基于完整历史生成回答

**实施难度：** ⭐⭐☆☆☆（简单）
**预计时间：** 30分钟
**效果提升：** ⭐⭐⭐⭐⭐（显著）

---

## 🎯 下一步

你想要我帮你实现这个功能吗？我可以：

1. 修改 API 接口代码
2. 修改前端组件代码
3. 添加对话历史管理 UI
4. 进行完整测试

只需要告诉我"开始实现"，我就会立即开始修改代码！
