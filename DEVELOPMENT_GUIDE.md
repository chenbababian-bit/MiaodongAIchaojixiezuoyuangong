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

### 五、底部操作按钮

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

**文档版本**: 2.0
**最后更新**: 2026-01-22
**维护者**: AI 编程助手

## 更新日志

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
