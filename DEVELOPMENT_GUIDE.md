# AI 写作助手功能开发文档

## 项目概述
本文档记录了小红书爆款文案功能的完整实现流程，包括前端表单、后端 API、富文本编辑器等核心模块。适用于后续类似 AI 写作功能的开发参考。

---

## 功能架构

### 1. 整体流程
```
用户输入 → 前端表单收集 → 调用后端 API → DeepSeek AI 处理 → 返回结果 → 富文本编辑器展示
```

### 2. 技术栈
- **前端框架**: Next.js 16 + React 19
- **UI 组件**: shadcn/ui + Tailwind CSS
- **AI 服务**: DeepSeek API
- **富文本编辑**: 原生 contentEditable + document.execCommand

---

## 核心模块实现

### 一、页面路由结构

#### 1.1 路由文件
**位置**: `app/writing/xiaohongshu/page.tsx`

```typescript
"use client";

import { AppLayout } from "@/components/app-layout";
import { XiaohongshuWritingPage } from "@/components/xiaohongshu-writing-page";

export default function XiaohongshuPage() {
  return (
    <AppLayout>
      <XiaohongshuWritingPage />
    </AppLayout>
  );
}
```

**关键点**:
- 使用 `"use client"` 标记为客户端组件
- 嵌套在 `AppLayout` 中保持统一布局
- 页面组件独立封装便于维护

---

### 二、主页面组件

#### 2.1 组件文件
**位置**: `components/xiaohongshu-writing-page.tsx`

#### 2.2 布局结构
```
┌─────────────────────────────────────────────────────────┐
│  左侧边栏 (280px)    │  中间表单区域  │  右侧结果区域 (400px) │
│  - 返回按钮          │  - 顶部筛选    │  - 结果标签切换      │
│  - 搜索框            │  - 标题描述    │  - 富文本编辑器      │
│  - 模板列表          │  - 示例提问    │  - 底部操作按钮      │
│                      │  - 输入表单    │  - 历史记录列表      │
│                      │  - 模型选择    │                      │
│                      │  - 提交按钮    │                      │
└─────────────────────────────────────────────────────────┘
```

#### 2.3 核心状态管理
```typescript
// 表单状态
const [contentInput, setContentInput] = useState("");
const [selectedModel, setSelectedModel] = useState("fast");

// 结果状态
const [isLoading, setIsLoading] = useState(false);
const [currentResult, setCurrentResult] = useState<string>("");
const [error, setError] = useState<string>("");

// 历史记录
const [history, setHistory] = useState<HistoryItem[]>([]);

// UI 状态
const [resultTab, setResultTab] = useState<"current" | "history">("current");
const [copied, setCopied] = useState(false);
```

#### 2.4 API 调用逻辑
```typescript
const handleSubmit = async () => {
  if (!contentInput.trim()) {
    setError("请输入文案主题或内容描述");
    return;
  }

  setIsLoading(true);
  setError("");
  setCurrentResult("");
  setResultTab("current");

  try {
    const response = await fetch("/api/xiaohongshu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: contentInput,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }

    setCurrentResult(data.result);

    // 添加到历史记录
    setHistory((prev) => [
      {
        id: Date.now(),
        content: contentInput,
        result: data.result,
        timestamp: new Date(),
      },
      ...prev,
    ]);
  } catch (err) {
    setError(err instanceof Error ? err.message : "创作失败，请重试");
  } finally {
    setIsLoading(false);
  }
};
```

**关键点**:
- 请求前清空旧结果和错误信息
- 使用 try-catch 捕获错误
- finally 确保加载状态正确重置
- 成功后自动添加到历史记录

---

### 三、后端 API 实现

#### 3.1 API 路由文件
**位置**: `app/api/xiaohongshu/route.ts`

#### 3.2 核心代码结构
```typescript
import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_KEY = "your-api-key";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// 系统提示词
const SYSTEM_PROMPT = `...`;

// 设置最大执行时间（重要！）
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    // 参数验证
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供文案主题内容" },
        { status: 400 }
      );
    }

    console.log("开始调用 DeepSeek API, 内容:", content);

    // 超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: content,
            },
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json(
          { error: `AI 服务错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
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
          { error: "请求超时，请重试" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
```

#### 3.3 关键配置项

**必须设置的配置**:
```typescript
// 1. 设置最大执行时间（Next.js 默认 10 秒会超时）
export const maxDuration = 60;

// 2. 使用 AbortController 控制请求超时
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 55000);

// 3. 清理超时定时器
clearTimeout(timeoutId);
```

**错误处理层级**:
1. 参数验证错误 → 400
2. AI 服务错误 → 500
3. 请求超时 → 504
4. 其他错误 → 500

---

### 四、富文本编辑器

#### 4.1 组件文件
**位置**: `components/rich-text-editor.tsx`

#### 4.2 核心功能

**1. Markdown 清理**
```typescript
// 清理 Markdown 标记（如 ** 粗体）
const formattedContent = initialContent
  .split("\n")
  .map((line) => {
    // 清理行内的 ** 标记
    let cleanLine = line.replace(/\*\*(.*?)\*\*/g, "$1");

    if (cleanLine.startsWith("### ")) {
      return `<h3>${cleanLine.substring(4)}</h3>`;
    } else if (cleanLine.startsWith("## ")) {
      return `<h2>${cleanLine.substring(3)}</h2>`;
    } else if (cleanLine.startsWith("# ")) {
      return `<h1>${cleanLine.substring(2)}</h1>`;
    } else if (cleanLine.startsWith("*   ")) {
      return `<p>${cleanLine.substring(4)}</p>`;
    } else if (cleanLine.startsWith("---")) {
      return `<hr/>`;
    } else if (cleanLine.trim() === "") {
      return `<p><br/></p>`;
    } else {
      return `<p>${cleanLine}</p>`;
    }
  })
  .join("");
```

**2. 格式化命令**
```typescript
const execCommand = useCallback(
  (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    checkFormatState();
    updateWordCount();
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  },
  [onChange, checkFormatState, updateWordCount]
);
```

**3. 工具栏功能**
- 文本格式: 粗体、斜体、下划线
- 标题层级: H1, H2, H3
- 对齐方式: 左对齐、居中、右对齐、两端对齐
- 缩进控制: 增加缩进、减少缩进
- 颜色设置: 文字颜色、背景高亮
- 撤销重做: Undo, Redo
- 字数统计: 实时更新

#### 4.3 样式配置
```typescript
<div
  ref={editorRef}
  contentEditable
  className="min-h-full p-4 outline-none prose prose-sm dark:prose-invert max-w-none
    [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:mt-4
    [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:mt-3
    [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-3
    [&>p]:mb-2 [&>p]:leading-relaxed
    [&>hr]:my-4 [&>hr]:border-border"
  onInput={handleInput}
  suppressContentEditableWarning
/>
```

---

### 五、Markdown格式清理功能

#### 5.1 功能概述

在AI写作助手中，DeepSeek等AI模型通常会返回包含Markdown格式标记的文本（如 `**粗体**`、`### 标题`、`- 列表` 等）。这些标记在技术文档中很有用，但在小红书、微信公众号等平台的内容创作中会影响用户体验和可读性。

**为什么需要清理Markdown格式**：
1. **提升可读性**：去除技术标记，让内容更自然流畅
2. **平台适配**：小红书、微信公众号不支持Markdown渲染
3. **用户体验**：用户期望看到纯文本，而不是带有 `**`、`###` 等标记的内容
4. **保留表达**：保留emoji表情符号，增强内容表现力

**清理效果示例**：
```
清理前：
### 标题
**这是粗体文本**，这是*斜体文本*
- 列表项1
- 列表项2
[链接文本](https://example.com)

清理后：
标题
这是粗体文本，这是斜体文本
列表项1
列表项2
链接文本
```

---

#### 5.2 核心实现文件

##### 5.2.1 服务端清理函数

**文件位置**: `lib/markdown-cleaner.ts`

**函数签名**:
```typescript
export function cleanMarkdown(text: string): string
```

**参数说明**:
- `text`: 原始文本（可能包含Markdown标记）
- 返回值: 清理后的纯文本

**清理的Markdown语法**（共13种）:

1. **代码块标记** (```) - 完全删除代码块及其内容
2. **行内代码标记** (`) - 保留内容，删除反引号
3. **粗体标记** (\*\*) - 支持嵌套和空格，运行两次确保完全清理
4. **斜体标记** (\*) - 处理单个星号
5. **删除线标记** (~~) - 删除波浪线，保留内容
6. **标题标记** (###, ##, #) - 删除1-6级标题的井号标记
7. **水平分隔线** (---, ___, \*\*\*) - 完全删除分隔线
8. **引用标记** (>) - 删除引用符号
9. **无序列表标记** (-, \*, +) - 只删除行首的列表标记
10. **有序列表标记** (1., 2., etc.) - 删除数字和点号
11. **链接** - 保留链接文本，删除URL部分
12. **图片标记** - 完全删除图片标记
13. **多余空行** - 压缩超过2个连续空行为2个

**关键实现细节**:
```typescript
// 1. 粗体标记清理 - 支持嵌套和空格
cleaned = cleaned.replace(/\*\*\s*([^*]+?)\s*\*\*/g, '$1');
// 运行两次处理嵌套情况
cleaned = cleaned.replace(/\*\*\s*([^*]+?)\s*\*\*/g, '$1');

// 2. 标题标记清理 - 使用正则表达式匹配行首
cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');

// 3. 列表标记清理 - 只删除行首的标记
cleaned = cleaned.replace(/^[\-\*\+]\s+/gm, '');
cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

// 4. 链接清理 - 保留文本，删除URL
cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
```

**完整代码**:
```typescript
export function cleanMarkdown(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // 删除代码块标记
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // 删除行内代码标记
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // 删除粗体标记（运行两次处理嵌套）
  cleaned = cleaned.replace(/\*\*\s*([^*]+?)\s*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*\s*([^*]+?)\s*\*\*/g, '$1');

  // 删除斜体标记
  cleaned = cleaned.replace(/\*([^*\s][^*]*?)\*/g, '$1');

  // 删除删除线标记
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');

  // 删除标题标记
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');

  // 删除水平分隔线
  cleaned = cleaned.replace(/^[\-_*]{3,}\s*$/gm, '');

  // 删除引用标记
  cleaned = cleaned.replace(/^>\s*/gm, '');

  // 删除列表标记
  cleaned = cleaned.replace(/^[\-\*\+]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

  // 删除链接，保留文本
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 删除图片标记
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // 清理多余空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
}
```

---

##### 5.2.2 客户端清理函数

**文件位置**: `lib/markdown-cleaner-client.ts`

**函数签名**:
```typescript
export function cleanMarkdownClient(text: string): string
```

**与服务端版本的关系**:
- 实现代码完全相同
- 创建独立文件是为了避免服务端和客户端代码混用的问题
- Next.js中，服务端组件和客户端组件需要明确区分

**为什么需要两个版本**:
1. **代码分离**: Next.js要求服务端和客户端代码分离
2. **打包优化**: 避免将服务端代码打包到客户端bundle中
3. **类型安全**: 确保在正确的环境中使用正确的函数

---

#### 5.3 应用位置详解

##### 5.3.1 服务端API路由应用

所有AI写作相关的API路由都在返回结果前应用了Markdown清理，确保数据库中存储的是纯文本。

**小红书模块API路由**（5个）:
1. `app/api/xiaohongshu/route.ts` - 小红书爆款文案
2. `app/api/xiaohongshu-title/route.ts` - 小红书爆款标题
3. `app/api/xiaohongshu-profile/route.ts` - 小红书账号简介
4. `app/api/xiaohongshu-seo/route.ts` - 小红书SEO关键词
5. `app/api/xiaohongshu-style/route.ts` - 小红书风格改写

**微信公众号模块API路由**（3个）:
1. `app/api/wechat-title/route.ts` - 公众号标题生成
2. `app/api/wechat-continue/route.ts` - 公众号内容续写
3. `app/api/wechat-clickbait/route.ts` - 公众号标题党生成

**通用模块**:
1. `app/api/chat/route.ts` - 通用聊天接口

**应用示例**:
```typescript
// app/api/xiaohongshu/route.ts
import { cleanMarkdown } from "@/lib/markdown-cleaner";

export async function POST(request: NextRequest) {
  // ... AI调用逻辑 ...

  const result = data.choices?.[0]?.message?.content;

  // 清理Markdown格式
  const cleanedResult = cleanMarkdown(result);

  return NextResponse.json({
    success: true,
    result: cleanedResult,  // 返回清理后的结果
  });
}
```

**应用时机**: 在AI返回结果后、返回给前端之前进行清理

---

##### 5.3.2 前端组件应用

前端组件在三个关键位置应用Markdown清理，确保用户界面显示的内容是纯文本。

**小红书模块** (`components/xiaohongshu-writing-page.tsx`):

1. **AI回复时清理**（第725行）:
```typescript
// 添加AI回复（清理markdown格式）
const aiMessage = {
  id: (Date.now() + 1).toString(),
  role: 'assistant' as const,
  content: cleanMarkdownClient(data.result),  // 清理markdown
  isCollapsed: false
};
setMessages(prev => [...prev, aiMessage]);
```

2. **历史记录加载时清理**（第1028-1052行）:
```typescript
// 恢复对话历史（清理markdown格式）
const msgs = conv.messages.map(msg => {
  const cleanedContent = msg.role === 'assistant'
    ? cleanMarkdownClient(msg.content)  // 只清理AI消息
    : msg.content;
  return {
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: cleanedContent,
    isCollapsed: false
  };
});
```

3. **显示最后一条AI回复时清理**（第1052行）:
```typescript
// 显示到富文本编辑器（双重清理）
const plainText = markdownToPlainText(
  cleanMarkdownClient(lastAssistantMsg.content)
);
setCurrentResult(plainText);
```

**微信公众号模块** (`components/wechat-writing-page.tsx`):
- 应用位置与小红书模块完全一致
- 第812行：AI回复时清理
- 第1119行：历史记录加载时清理
- 第1142行：显示到编辑器时清理

**应用时机**:
- 接收API响应时立即清理
- 加载历史对话时清理
- 显示到富文本编辑器时清理

---

#### 5.4 数据流程

##### 5.4.1 完整的数据流程图

```
用户输入
   ↓
前端发送请求 → API路由
                  ↓
              调用DeepSeek AI
                  ↓
              AI返回结果（含Markdown标记）
                  ↓
              cleanMarkdown(result) ← 【服务端清理】
                  ↓
              返回清理后的结果
                  ↓
前端接收 → cleanMarkdownClient(data.result) ← 【客户端清理】
              ↓
          显示在对话框中
              ↓
          保存到数据库（已清理）
              ↓
加载历史记录 → cleanMarkdownClient(msg.content) ← 【显示时再次清理】
              ↓
          显示在界面上
```

---

##### 5.4.2 为什么需要两次清理

**服务端清理**（API路由中）:
- **目的**: 在数据存储前清理，确保数据库中存储的是纯文本
- **位置**: API路由返回结果前
- **好处**:
  - 数据库中存储干净的数据
  - 减少客户端处理负担
  - 统一数据格式
  - 便于数据分析和搜索

**客户端清理**（前端组件中）:
- **目的**: 防御性编程，确保显示时一定是纯文本
- **位置**: 接收API响应时、加载历史记录时、显示消息时
- **好处**:
  - 兼容旧数据（可能包含Markdown）
  - 处理可能的服务端清理遗漏
  - 确保UI显示一致性
  - 提供额外的安全保障

**双重清理的优势**:
1. **数据一致性**: 确保存储和显示的数据都是纯文本
2. **向后兼容**: 即使旧数据包含Markdown，显示时也会被清理
3. **容错性**: 如果服务端清理失败，客户端仍会清理
4. **可维护性**: 每一层都有自己的清理逻辑，职责清晰

---

#### 5.5 清理逻辑详解

##### 5.5.1 代码块清理

**正则表达式**: `/```[\s\S]*?```/g`

**说明**:
- `[\s\S]*?` 匹配任意字符（包括换行符）
- `*?` 非贪婪匹配，避免匹配过多内容
- 完全删除代码块标记和内容

**示例**:
```
输入: 这是一段文本\n```javascript\nconst a = 1;\n```\n继续文本
输出: 这是一段文本\n\n继续文本
```

---

##### 5.5.2 粗体标记清理

**正则表达式**: `/\*\*\s*([^*]+?)\s*\*\*/g`

**说明**:
- `\s*` 匹配星号和内容之间的空格（支持 `** text **` 格式）
- `([^*]+?)` 捕获非星号字符（内容部分）
- 运行两次以处理嵌套的粗体标记

**示例**:
```
输入: **这是粗体**，** 这也是粗体 **
输出: 这是粗体，这也是粗体
```

**嵌套处理**:
```
输入: ****嵌套粗体****
第一次: **嵌套粗体**
第二次: 嵌套粗体
```

---

##### 5.5.3 标题标记清理

**正则表达式**: `/^#{1,6}\s*/gm`

**说明**:
- `^` 匹配行首
- `#{1,6}` 匹配1-6个井号（支持所有级别的标题）
- `\s*` 匹配井号后的空格
- `gm` 标志：全局匹配 + 多行模式

**示例**:
```
输入:
### 三级标题
## 二级标题
# 一级标题

输出:
三级标题
二级标题
一级标题
```

---

##### 5.5.4 列表标记清理

**无序列表**: `/^[\-\*\+]\s+/gm`
**有序列表**: `/^\d+\.\s+/gm`

**说明**:
- 只删除行首的列表标记
- 保留文本中间的星号、减号等字符
- 支持三种无序列表标记：`-`、`*`、`+`

**示例**:
```
输入:
- 列表项1
* 列表项2
+ 列表项3
1. 有序列表1
2. 有序列表2

输出:
列表项1
列表项2
列表项3
有序列表1
有序列表2
```

---

##### 5.5.5 其他标记清理

**链接清理**: `/\[([^\]]+)\]\([^)]+\)/g`
- 保留链接文本，删除URL
- 示例: `[百度](https://baidu.com)` → `百度`

**图片清理**: `/!\[[^\]]*\]\([^)]+\)/g`
- 完全删除图片标记
- 示例: `![图片](image.jpg)` → （删除）

**引用清理**: `/^>\s*/gm`
- 删除行首的引用符号
- 示例: `> 这是引用` → `这是引用`

**分隔线清理**: `/^[\-_*]{3,}\s*$/gm`
- 删除由3个或更多 `-`、`_`、`*` 组成的分隔线
- 示例: `---` → （删除）

**多余空行清理**: `/\n{3,}/g`
- 将3个或更多连续换行符压缩为2个
- 保持适当的段落间距

---

#### 5.6 使用方法

##### 5.6.1 在API路由中使用

**步骤1**: 导入清理函数
```typescript
import { cleanMarkdown } from "@/lib/markdown-cleaner";
```

**步骤2**: 在返回结果前清理
```typescript
export async function POST(request: NextRequest) {
  try {
    // ... 调用AI API ...

    const result = data.choices?.[0]?.message?.content;

    // 清理Markdown格式
    const cleanedResult = cleanMarkdown(result);

    return NextResponse.json({
      success: true,
      result: cleanedResult,  // 返回清理后的结果
    });
  } catch (error) {
    // ... 错误处理 ...
  }
}
```

**完整示例**:
```typescript
// app/api/xiaohongshu/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content } = body;

  // 调用AI API
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: content },
      ],
    }),
  });

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content;

  // 清理Markdown格式
  const cleanedResult = cleanMarkdown(result);

  return NextResponse.json({
    success: true,
    result: cleanedResult,
  });
}
```

---

##### 5.6.2 在前端组件中使用

**步骤1**: 导入客户端清理函数
```typescript
import { cleanMarkdownClient } from "@/lib/markdown-cleaner-client";
```

**步骤2**: 在接收AI回复时清理
```typescript
const handleSendMessage = async () => {
  // ... 发送请求 ...

  const response = await fetch("/api/xiaohongshu", {
    method: "POST",
    body: JSON.stringify({ content: userInput }),
  });

  const data = await response.json();

  // 添加AI回复（清理markdown格式）
  const aiMessage = {
    id: Date.now().toString(),
    role: 'assistant' as const,
    content: cleanMarkdownClient(data.result),  // 清理
    isCollapsed: false
  };

  setMessages(prev => [...prev, aiMessage]);
};
```

**步骤3**: 在加载历史记录时清理
```typescript
const loadHistory = async (conversationId: string) => {
  // ... 加载对话 ...

  const msgs = conversation.messages.map(msg => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: msg.role === 'assistant'
      ? cleanMarkdownClient(msg.content)  // 只清理AI消息
      : msg.content,  // 保留用户输入
    isCollapsed: false
  }));

  setMessages(msgs);
};
```

**步骤4**: 在显示到富文本编辑器时清理
```typescript
// 显示最后一条AI回复
if (lastAssistantMsg) {
  const plainText = markdownToPlainText(
    cleanMarkdownClient(lastAssistantMsg.content)  // 双重清理
  );
  setCurrentResult(plainText);
}
```

---

#### 5.7 开发历史

Markdown格式清理功能经历了三个主要版本的迭代：

##### 版本1: 初始实现（commit a2a930b）
**时间**: 2026-02-04 03:18:23

**内容**:
- 创建 `lib/markdown-cleaner.ts` 服务端清理函数
- 在所有小红书API路由中应用清理
- 实现基础的Markdown标记清理
- 保留emoji表情符号

**清理的标记**:
- 粗体、斜体、删除线
- 标题、列表、引用
- 链接、图片
- 代码块

---

##### 版本2: 功能改进（commit e7ef8de）
**时间**: 2026-02-04 03:22:00

**改进内容**:
- 增强粗体标记清理，支持星号和内容之间有空格（`** text **`）
- 改进标题标记清理，使用更精确的正则表达式
- 添加多次运行处理嵌套的粗体标记
- 优化正则表达式性能
- 添加多余空行清理功能
- 改进水平分隔线清理

**解决的问题**:
- 嵌套粗体标记无法完全清理
- 带空格的粗体格式（`** text **`）无法识别
- 多余空行导致排版不美观

---

##### 版本3: 前端应用（commit 8ef626d）
**时间**: 2026-02-04 03:28:39

**新增内容**:
- 创建客户端版本 `lib/markdown-cleaner-client.ts`
- 在小红书模块前端组件中应用清理
- 在显示AI回复时清理
- 在加载历史对话时清理
- 确保对话历史中的Markdown标记被正确清理

**解决的问题**:
- 对话框中仍显示 `**`、`###` 等Markdown标记
- 历史记录加载后显示原始Markdown格式
- 服务端清理后，前端仍需要额外处理

**实现的双重清理机制**:
- 服务端清理：数据存储前
- 客户端清理：数据显示前

---

#### 5.8 最佳实践

##### 1. 服务端和客户端都应用清理

**原因**:
- 服务端清理确保数据库存储纯文本
- 客户端清理确保UI显示一致性
- 双重保障提高系统可靠性

**示例**:
```typescript
// 服务端（API路由）
const cleanedResult = cleanMarkdown(result);
return NextResponse.json({ result: cleanedResult });

// 客户端（组件）
const aiMessage = {
  content: cleanMarkdownClient(data.result),
};
```

---

##### 2. 只对assistant角色的消息清理

**原因**:
- AI返回的内容可能包含Markdown标记
- 用户输入应保持原样，不做修改
- 保留用户的原始表达意图

**示例**:
```typescript
const cleanedContent = msg.role === 'assistant'
  ? cleanMarkdownClient(msg.content)  // 只清理AI消息
  : msg.content;  // 保留用户输入
```

---

##### 3. 保留用户输入的原始格式

**原因**:
- 用户可能故意使用特殊字符
- 不应该修改用户的原始输入
- 只清理AI生成的内容

**错误示例**:
```typescript
// ❌ 错误：清理了用户输入
const userMessage = {
  content: cleanMarkdownClient(userInput),  // 不要这样做
};
```

**正确示例**:
```typescript
// ✅ 正确：保留用户输入
const userMessage = {
  content: userInput,  // 保持原样
};
```

---

##### 4. 测试各种Markdown语法的清理效果

**测试用例**:
```typescript
// 测试粗体
cleanMarkdown("**粗体**") // → "粗体"
cleanMarkdown("** 粗体 **") // → "粗体"

// 测试嵌套
cleanMarkdown("****嵌套****") // → "嵌套"

// 测试标题
cleanMarkdown("### 标题") // → "标题"

// 测试列表
cleanMarkdown("- 列表项") // → "列表项"

// 测试链接
cleanMarkdown("[文本](url)") // → "文本"

// 测试emoji（应保留）
cleanMarkdown("😊 **开心**") // → "😊 开心"
```

---

##### 5. 在新模块中应用清理功能

**步骤**:

1. **在API路由中导入并使用**:
```typescript
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const cleanedResult = cleanMarkdown(aiResult);
return NextResponse.json({ result: cleanedResult });
```

2. **在前端组件中导入并使用**:
```typescript
import { cleanMarkdownClient } from "@/lib/markdown-cleaner-client";

// AI回复时清理
const aiMessage = {
  content: cleanMarkdownClient(data.result),
};

// 历史记录加载时清理
const cleanedContent = msg.role === 'assistant'
  ? cleanMarkdownClient(msg.content)
  : msg.content;
```

3. **测试清理效果**:
- 发送包含Markdown标记的测试输入
- 验证AI回复中的标记被正确清理
- 检查历史记录加载后的显示效果
- 确认emoji表情被正确保留

---

##### 6. 处理边缘情况

**空值处理**:
```typescript
// 函数内部已处理空值
if (!text) return text;
```

**特殊字符处理**:
- emoji表情会被保留
- 中文标点符号不受影响
- 英文标点符号正常显示

**性能考虑**:
- 正则表达式已优化
- 对于长文本（<10000字符）性能良好
- 如需处理超长文本，考虑分段处理

---

### 六、底部操作按钮

#### 5.1 按钮功能

**左侧按钮组**:
```typescript
<div className="flex items-center gap-2">
  {/* 分享 */}
  <Button onClick={() => {
    if (navigator.share) {
      navigator.share({
        title: "小红书爆款文案",
        text: currentResult,
      });
    }
  }}>
    <Share2 className="h-4 w-4 mr-1" />
    分享
  </Button>

  {/* 重写 */}
  <Button onClick={handleSubmit} disabled={isLoading}>
    <RefreshCw className="h-4 w-4 mr-1" />
    重写
  </Button>

  {/* 复制 */}
  <Button onClick={() => handleCopy(currentResult)}>
    {copied ? (
      <>
        <Check className="h-4 w-4 mr-1 text-green-500" />
        已复制
      </>
    ) : (
      <>
        <Copy className="h-4 w-4 mr-1" />
        复制
      </>
    )}
  </Button>
</div>
```

**右侧按钮组**:
```typescript
<div className="flex items-center gap-2">
  {/* 取消 */}
  <Button onClick={() => setCurrentResult("")}>
    <X className="h-4 w-4 mr-1" />
    取消
  </Button>

  {/* 保存 */}
  <Button onClick={() => {
    // 保存到历史记录
    alert("已保存");
  }}>
    <Save className="h-4 w-4 mr-1" />
    保存
  </Button>
</div>
```

---

## 开发规范

### 1. 文件组织
```
app/
├── writing/
│   └── xiaohongshu/
│       └── page.tsx          # 页面路由
├── api/
│   └── xiaohongshu/
│       └── route.ts          # API 路由

components/
├── xiaohongshu-writing-page.tsx  # 主页面组件
├── rich-text-editor.tsx          # 富文本编辑器
└── ui/                           # UI 组件库
```

### 2. 命名规范
- **页面组件**: `XiaohongshuWritingPage`
- **API 路由**: `/api/xiaohongshu`
- **状态变量**: 使用描述性名称，如 `isLoading`, `currentResult`
- **函数命名**: 使用动词开头，如 `handleSubmit`, `handleCopy`

### 3. 状态管理原则
- 使用 `useState` 管理本地状态
- 避免过度拆分状态，相关状态可以合并
- 异步操作使用 try-catch-finally 模式
- 加载状态和错误状态分开管理

### 4. 错误处理
```typescript
try {
  // 主要逻辑
} catch (err) {
  // 错误处理
  setError(err instanceof Error ? err.message : "默认错误信息");
} finally {
  // 清理工作
  setIsLoading(false);
}
```

### 5. API 设计原则
- 使用 POST 方法传递数据
- 返回统一的 JSON 格式
- 包含 success 标志和 error 信息
- 设置合理的超时时间
- 添加详细的日志输出

---

## 常见问题与解决方案

### 问题 1: API 请求超时
**原因**: Next.js 默认 API 路由超时时间为 10 秒

**解决方案**:
```typescript
// 在 route.ts 中添加
export const maxDuration = 60;
```

### 问题 2: Markdown 格式显示
**原因**: AI 返回的内容包含 Markdown 标记（如 `**`）

**解决方案**:
```typescript
// 在富文本编辑器中清理
let cleanLine = line.replace(/\*\*(.*?)\*\*/g, "$1");
```

### 问题 3: 富文本编辑器内容不更新
**原因**: `initialContent` 变化时没有触发重新渲染

**解决方案**:
```typescript
useEffect(() => {
  if (editorRef.current && initialContent) {
    editorRef.current.innerHTML = formattedContent;
  }
}, [initialContent]);
```

### 问题 4: 复制功能不工作
**原因**: 需要使用 Clipboard API

**解决方案**:
```typescript
const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};
```

---

## 扩展开发指南

### 添加新的写作模板

**步骤 1**: 创建新的页面路由
```typescript
// app/writing/[template-name]/page.tsx
export default function TemplatePage() {
  return (
    <AppLayout>
      <TemplateWritingPage />
    </AppLayout>
  );
}
```

**步骤 2**: 创建对应的 API 路由
```typescript
// app/api/[template-name]/route.ts
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 实现逻辑
}
```

**步骤 3**: 更新首页模板卡片跳转
```typescript
const handleClick = () => {
  if (template.icon === "template-name") {
    router.push("/writing/template-name");
  }
};
```

### 自定义系统提示词

**位置**: `app/api/[template-name]/route.ts`

**格式**:
```typescript
const SYSTEM_PROMPT = `
# Role: [角色定位]

## Profile
- **Author**: [作者]
- **Version**: [版本]
- **Language**: [语言]
- **Description**: [描述]

## Skills
1. [技能1]
2. [技能2]

## Rules & Constraints
1. [规则1]
2. [规则2]

## Output Format
[输出格式说明]
`;
```

---

## 性能优化建议

### 1. 前端优化
- 使用 `useCallback` 缓存函数
- 使用 `useMemo` 缓存计算结果
- 避免不必要的重新渲染
- 图片使用 Next.js Image 组件

### 2. API 优化
- 设置合理的超时时间
- 添加请求缓存机制
- 使用流式响应（如果 AI 支持）
- 添加请求限流

### 3. 用户体验优化
- 添加加载动画
- 显示预计等待时间
- 提供示例提问
- 支持历史记录查看

---

## 测试清单

### 功能测试
- [ ] 表单输入验证
- [ ] API 调用成功
- [ ] 结果正确显示
- [ ] 富文本编辑功能
- [ ] 复制功能
- [ ] 历史记录保存
- [ ] 错误提示显示

### 边界测试
- [ ] 空输入处理
- [ ] 超长文本处理
- [ ] 网络错误处理
- [ ] API 超时处理
- [ ] 特殊字符处理

### 兼容性测试
- [ ] Chrome 浏览器
- [ ] Firefox 浏览器
- [ ] Safari 浏览器
- [ ] Edge 浏览器
- [ ] 移动端浏览器

---

## 部署注意事项

### 环境变量
```env
# .env.local
DEEPSEEK_API_KEY=your-api-key
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Vercel 部署配置
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### 安全配置
- API Key 不要硬编码在代码中
- 使用环境变量管理敏感信息
- 添加请求频率限制
- 验证用户身份（如需要）

---

## 历史记录存储系统

### 设计架构

项目采用**适配器模式**实现历史记录存储，支持本地测试和云端数据库的无缝切换。

#### 核心文件
**位置**: `lib/history-storage.ts`

#### 架构图
```
┌─────────────────────────────────────┐
│   HistoryStorageManager (管理器)    │
│   - 根据环境变量选择适配器           │
│   - 提供统一的存储接口               │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼──────┐
│ LocalStorage│  │  Database  │
│   Adapter   │  │   Adapter  │
│  (本地测试)  │  │ (生产环境)  │
└─────────────┘  └────────────┘
```

### 功能特性

#### 1. 按模板分类存储
- 每个写作模板有独立的历史记录
- 切换模板时自动加载对应的历史记录
- 历史记录包含：模板ID、模板标题、输入内容、生成结果、时间戳

#### 2. 本地持久化（LocalStorage）
- **适用场景**：本地测试、开发环境
- **存储位置**：浏览器 localStorage
- **数据持久性**：长期保存，除非手动清除浏览器数据
- **容量限制**：每个模板最多保存 50 条历史记录
- **优点**：
  - 无需后端支持
  - 数据完全本地化
  - 响应速度快
  - 适合测试和演示

#### 3. 云端数据库（Database）
- **适用场景**：生产环境、多设备同步
- **存储位置**：云端数据库（需实现 API）
- **数据持久性**：永久保存
- **优点**：
  - 多设备同步
  - 数据安全备份
  - 支持用户系统
  - 可扩展性强

### 环境变量配置

#### 本地测试配置
```env
# .env.local
NEXT_PUBLIC_USE_DATABASE=false
```

#### 生产环境配置
```env
# .env.local 或 Vercel 环境变量
NEXT_PUBLIC_USE_DATABASE=true
```

### 使用方法

#### 在组件中使用
```typescript
import { historyStorage, HistoryItem } from "@/lib/history-storage";

// 加载历史记录
const loadHistory = async () => {
  const historyData = await historyStorage.getHistory(templateId);
  setHistory(historyData);
};

// 添加历史记录
const addHistory = async () => {
  const newItem = await historyStorage.addHistory(
    templateId,
    templateTitle,
    content,
    result
  );
  setHistory((prev) => [newItem, ...prev]);
};

// 删除历史记录
const deleteHistory = async (id: number) => {
  await historyStorage.deleteHistory(id);
  setHistory((prev) => prev.filter((item) => item.id !== id));
};
```

### 切换存储方式

#### 从本地存储切换到数据库

**步骤 1**: 实现数据库 API 路由

创建 `app/api/history/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

// GET /api/history?templateId=1
export async function GET(request: NextRequest) {
  const templateId = request.nextUrl.searchParams.get("templateId");

  // 从数据库查询历史记录
  const history = await db.history.findMany({
    where: { templateId },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json(history);
}

// POST /api/history
export async function POST(request: NextRequest) {
  const body = await request.json();

  // 保存到数据库
  const newItem = await db.history.create({
    data: body,
  });

  return NextResponse.json(newItem);
}

// DELETE /api/history/[id]
// 实现删除逻辑...
```

**步骤 2**: 修改环境变量
```env
NEXT_PUBLIC_USE_DATABASE=true
```

**步骤 3**: 重启应用
```bash
npm run dev
```

#### 数据迁移

如果需要将本地 localStorage 数据迁移到数据库：

```typescript
// 创建迁移脚本
async function migrateLocalStorageToDatabase() {
  const localData = localStorage.getItem('ai_writing_history');
  if (!localData) return;

  const history = JSON.parse(localData);

  for (const item of history) {
    await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  }

  console.log('迁移完成！');
}
```

### 数据结构

```typescript
interface HistoryItem {
  id: number;              // 唯一标识
  templateId: string;      // 模板ID
  templateTitle: string;   // 模板标题
  content: string;         // 用户输入内容
  result: string;          // AI 生成结果
  timestamp: Date;         // 创建时间
}
```

### 最佳实践

#### 1. 本地测试阶段
- 使用 `NEXT_PUBLIC_USE_DATABASE=false`
- 数据保存在浏览器中，方便测试
- 可以随时清除浏览器数据重新测试

#### 2. 上线前准备
- 实现完整的数据库 API 路由
- 测试数据库连接和 CRUD 操作
- 配置生产环境的环境变量

#### 3. 上线后
- 修改 `NEXT_PUBLIC_USE_DATABASE=true`
- 部署到 Vercel 或其他平台
- 监控数据库性能和存储容量

### 故障排查

#### 问题 1: 历史记录不显示
**检查**:
- 确认环境变量配置正确
- 检查浏览器控制台是否有错误
- 验证 localStorage 中是否有数据

#### 问题 2: 切换模板后历史记录丢失
**原因**: 这是正常行为，每个模板有独立的历史记录

#### 问题 3: 数据库模式下无法保存
**检查**:
- API 路由是否正确实现
- 数据库连接是否正常
- 网络请求是否成功

---

## 维护与更新

### 日志记录
```typescript
console.log("开始调用 DeepSeek API, 内容:", content);
console.log("DeepSeek API 响应状态:", response.status);
console.log("DeepSeek API 返回成功");
```

### 监控指标
- API 调用成功率
- 平均响应时间
- 错误类型分布
- 用户使用频率

### 版本更新
- 记录每次功能更新
- 保持向后兼容
- 及时更新依赖包
- 定期代码审查

---

## 参考资源

### 官方文档
- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)

### 相关文件
- `components/xiaohongshu-writing-page.tsx` - 主页面组件
- `components/rich-text-editor.tsx` - 富文本编辑器
- `app/api/xiaohongshu/route.ts` - API 路由
- `app/writing/xiaohongshu/page.tsx` - 页面路由
- `lib/history-storage.ts` - 历史记录存储系统

---

**文档版本**: 2.1
**最后更新**: 2026-02-04
**维护者**: AI 编程助手

## 更新日志

### v2.1 (2026-02-04)
- 📝 新增第五章：Markdown格式清理功能
- 🧹 详细说明服务端和客户端清理实现原理
- 📍 记录所有应用位置（API路由和前端组件）
- 🔄 添加完整的数据流程图和双重清理机制说明
- 💡 提供使用方法、最佳实践和开发历史
- 🎯 包含13种Markdown语法的清理逻辑详解
- ✅ 添加测试用例和边缘情况处理指南

### v2.0 (2026-01-22)
- ✨ 新增历史记录存储系统
- 🔄 实现适配器模式支持本地和云端存储切换
- 💾 添加 localStorage 持久化存储
- 🌐 预留数据库存储接口
- 📝 完善开发文档

### v1.0 (2026-01-22)
- 🎉 初始版本
- ✨ 实现小红书爆款文案功能
- 📝 创建开发文档
