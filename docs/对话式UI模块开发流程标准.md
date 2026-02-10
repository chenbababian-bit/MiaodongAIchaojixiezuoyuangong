# 对话式UI模块开发流程标准

## 📋 文档说明

本文档提供了对话式UI模块的标准开发流程，适用于所有需要实现对话式交互界面的功能模块。

**创建时间：** 2026-02-11
**适用范围：** 小红书、沟通协作、汇报总结等所有对话式UI模块
**参考案例：** 小红书模块、会议邀请函模块

---

## 🎯 对话式UI特点

### 核心优势
- ✅ 渐进式引导，降低用户认知负担
- ✅ 多轮对话，支持迭代优化
- ✅ 实时反馈，提升交互体验
- ✅ 历史记录，方便回溯和复用

### 适用场景
- 需要收集多个信息点的复杂表单
- 需要AI辅助创作的内容生成
- 需要多轮交互优化的场景
- 需要保存对话历史的场景

---

## 🏗️ 标准架构设计

### 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  返回  [模块名称]    新建对话  历史记录    文本编辑器  复制  │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│  对话消息区域 (50%)          │  富文本编辑器 (50%)          │
│                              │                              │
│  - AI欢迎消息                │  - 显示生成结果              │
│  - 用户输入消息              │  - 支持实时编辑              │
│  - AI回复消息                │  - 格式化显示                │
│  - 加载状态                  │                              │
│                              │                              │
├──────────────────────────────┤                              │
│  输入框 (自适应高度)    发送  │                              │
│  对话轮次: 0/5               │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### 技术栈
- **框架：** Next.js 14 (App Router)
- **UI库：** React 18 + TypeScript
- **组件库：** shadcn/ui
- **样式：** Tailwind CSS
- **状态管理：** React Hooks
- **数据库：** Supabase (历史记录)

---

## 📝 开发流程（5步法）

### 第一步：分析参考模板

**目标：** 了解现有对话式界面的实现逻辑

**操作：**
```bash
# 读取参考组件
Read components/xiaohongshu-writing-page.tsx
# 或
Read components/communication-writing-page.tsx
```

**关键要点：**
- 左右50/50分栏布局
- 左侧：对话消息区域 + 底部输入框
- 右侧：富文本编辑器 / 历史记录切换
- 支持多轮对话，最多5轮
- 使用MessageBubble组件显示消息
- 输入框高度自适应（60px-150px）

---

### 第二步：创建新组件

**目标：** 基于参考模板创建新模块的对话式组件

**操作：**
```bash
# 复制参考组件
cp components/xiaohongshu-writing-page.tsx components/[新模块]-writing-page.tsx

# 批量替换组件名称
sed -i 's/XiaohongshuWritingPage/[新模块]WritingPage/g' components/[新模块]-writing-page.tsx
sed -i 's/xiaohongshu/[新模块]/g' components/[新模块]-writing-page.tsx
```

**关键修改点：**

#### 2.1 更新模板ID范围
```typescript
// 示例：汇报总结模块 (1101-1112)
const reportTemplateIds = ["1101", "1102", "1103", "1104", "1105", "1106",
                           "1107", "1108", "1109", "1110", "1111", "1112"];

if (reportTemplateIds.includes(templateId)) {
  // 对话式UI逻辑
}
```

#### 2.2 配置欢迎消息
```typescript
const getWelcomeMessage = (templateId: string): string => {
  const welcomeMessages: Record<string, string> = {
    "1101": `您好！我是工作总结大师，拥有50年项目管理经验。

我可以帮您：
- 快速梳理工作内容，建立清晰的总结框架
- 提炼工作亮点和核心成果
- 提供数据分析和可视化建议

请告诉我：
- 您需要撰写什么类型的工作总结？（周报/月报/季度/年度）
- 您所在的行业和岗位是什么？
- 这份总结主要汇报给谁？`,

    "1102": `您好！我是工作计划大师...`,
    // ... 其他模板的欢迎消息
  };
  return welcomeMessages[templateId] || welcomeMessages["1101"];
};
```

**欢迎消息编写规范：**
- ❌ 禁止使用emoji表情符号
- ❌ 禁止使用markdown格式标记（**、###、---等）
- ✅ 使用纯文本格式
- ✅ 使用数字列表（1. 2. 3.）
- ✅ 使用短横线（-）表示列表项
- ✅ 清晰说明角色定位和能力
- ✅ 引导用户提供必要信息

#### 2.3 配置API端点映射
```typescript
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "1101": return "/api/report/work-summary";
    case "1102": return "/api/report/work-plan";
    case "1103": return "/api/report/project-progress";
    // ... 其他端点
    default: return "/api/report/work-summary";
  }
};
```

#### 2.4 更新新建对话函数
```typescript
const handleNewConversation = () => {
  setConversationHistory([]);
  setCurrentResult("");
  setError("");
  setCurrentConversationId(null);
  setInputValue("");

  const templateIds = ["1101", "1102", ..., "1112"];
  if (templateIds.includes(templateId)) {
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
```

---

### 第三步：创建路由配置

**目标：** 为新模块创建专用路由

**操作：**
```bash
# 创建路由目录
mkdir -p app/writing/[新模块]

# 创建路由文件
touch app/writing/[新模块]/page.tsx
```

**文件内容：**
```typescript
import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { [新模块]WritingPage } from "@/components/[新模块]-writing-page";

export default function [新模块]Page() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <[新模块]WritingPage />
      </Suspense>
    </AppLayout>
  );
}
```

---

### 第四步：添加自动重定向

**目标：** 让用户访问通用页面时自动跳转到对话式界面

**操作：**
修改 `components/general-writing-detail-page.tsx`

**添加重定向逻辑：**
```typescript
export function GeneralWritingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1001";
  const templateTitle = searchParams.get("title") || "通用写作";

  // 检测模板ID范围，自动重定向到对话式界面
  useEffect(() => {
    const numId = parseInt(templateId);

    // 汇报总结模块 (1101-1112)
    if (numId >= 1101 && numId <= 1112) {
      const source = searchParams.get("source") || "general";
      router.replace(`/writing/report?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
    }

    // 沟通协作模块 (1001-1013)
    if (numId >= 1001 && numId <= 1013) {
      const source = searchParams.get("source") || "general";
      router.replace(`/writing/communication?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
    }
  }, [templateId, templateTitle, router, searchParams]);

  // ... 其余代码
}
```

---

### 第五步：数据库和类型配置

#### 5.1 更新数据库表结构

**文件：** `supabase/migrations/[timestamp]_add_[module]_types.sql`

```sql
-- 添加新的对话类型到conversations表的CHECK约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN (
  'qa', 'role',
  -- 小红书类型
  'xiaohongshu-travel',
  'xiaohongshu-copywriting',
  -- ... 其他小红书类型

  -- 沟通协作类型
  'communication-meeting-invitation',
  'communication-meeting-minutes',
  -- ... 其他沟通协作类型

  -- 汇报总结类型（新增）
  'report-work-summary',
  'report-work-plan',
  'report-project-progress',
  'report-sales-performance',
  'report-financial',
  'report-market-analysis',
  'report-annual-review',
  'report-probation-review',
  'report-performance-evaluation',
  'report-performance-improvement',
  'report-department-brief',
  'report-business-development'
));
```

#### 5.2 更新对话类型映射

**文件：** `lib/conversations.ts`

```typescript
// 添加新模块的类型定义
export type ReportType =
  | 'report-work-summary'           // 1101
  | 'report-work-plan'              // 1102
  | 'report-project-progress'       // 1103
  | 'report-sales-performance'      // 1104
  | 'report-financial'              // 1105
  | 'report-market-analysis'        // 1106
  | 'report-annual-review'          // 1107
  | 'report-probation-review'       // 1108
  | 'report-performance-evaluation' // 1109
  | 'report-performance-improvement'// 1110
  | 'report-department-brief'       // 1111
  | 'report-business-development';  // 1112

// 更新ConversationType联合类型
export type ConversationType =
  | 'qa'
  | 'role'
  | XiaohongshuType
  | CommunicationType
  | ReportType;  // 新增

// 添加模板ID到对话类型的映射函数
export function getReportTypeByTemplateId(templateId: string): ReportType {
  const mapping: Record<string, ReportType> = {
    '1101': 'report-work-summary',
    '1102': 'report-work-plan',
    '1103': 'report-project-progress',
    '1104': 'report-sales-performance',
    '1105': 'report-financial',
    '1106': 'report-market-analysis',
    '1107': 'report-annual-review',
    '1108': 'report-probation-review',
    '1109': 'report-performance-evaluation',
    '1110': 'report-performance-improvement',
    '1111': 'report-department-brief',
    '1112': 'report-business-development',
  };
  return mapping[templateId] || 'report-work-summary';
}
```

---

## 🔧 API端点开发

### 标准API端点结构

**文件位置：** `app/api/[module]/[subtype]/route.ts`

**示例：** `app/api/report/work-summary/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

// 系统提示词（从docs/report-prompts/1101-周月季度工作总结.md获取）
const SYSTEM_PROMPT = `
# 工作总结大师 Prompt

## 角色 (Role)
工作总结大师 - 拥有50年项目管理与总结撰写经验的专业顾问

... （完整的系统提示词内容）
`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // 构建完整的消息历史
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    // 调用AI API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: fullMessages,
      }),
    });

    const data = await response.json();
    const result = data.content[0].text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
```

---

## ✅ 测试清单

### 功能测试
- [ ] 访问 `/writing/general?template=[ID]` 能否自动重定向
- [ ] 对话式界面是否正常显示
- [ ] 欢迎消息是否正确显示（无emoji、无markdown）
- [ ] 输入框是否支持Enter发送、Shift+Enter换行
- [ ] 输入框高度是否自适应（60px-150px）
- [ ] 多轮对话是否正常工作（最多5轮）
- [ ] 对话轮次显示是否正确
- [ ] 新建对话功能是否正常
- [ ] 历史记录功能是否正常
- [ ] 富文本编辑器是否正常显示结果
- [ ] 复制功能是否正常
- [ ] 返回按钮是否正常

### 数据测试
- [ ] 对话历史是否正确保存到数据库
- [ ] 对话类型是否正确映射
- [ ] 历史记录是否能正确加载
- [ ] 历史记录是否能正确恢复对话

---

## 📊 开发进度跟踪模板

```markdown
## [模块名称] 对话式UI开发进度

### 第一步：分析参考模板 ✅
- [x] 阅读xiaohongshu-writing-page.tsx
- [x] 理解对话式UI实现逻辑

### 第二步：创建新组件 ⏳
- [ ] 复制参考组件
- [ ] 更新模板ID范围
- [ ] 配置欢迎消息（12个子类型）
- [ ] 配置API端点映射
- [ ] 更新新建对话函数

### 第三步：创建路由配置 ⏳
- [ ] 创建路由目录
- [ ] 创建路由文件

### 第四步：添加自动重定向 ⏳
- [ ] 修改general-writing-detail-page.tsx
- [ ] 添加重定向逻辑

### 第五步：数据库和类型配置 ⏳
- [ ] 更新数据库表结构
- [ ] 更新对话类型映射
- [ ] 创建12个API端点文件

### 测试和部署 ⏳
- [ ] 功能测试
- [ ] 数据测试
- [ ] 提交代码
- [ ] 推送到远程仓库
```

---

## 📚 参考文档

- [小红书模块开发规范](./小红书模块开发规范.md) - 格式规范
- [会议邀请函对话式UI实现](./communication-dialog-ui-implementation.md) - 实际案例
- [对话历史和UI设计](./conversation-history-and-ui-design.md) - 设计文档

---

## 🐛 常见问题

### Q1: 为什么要禁止emoji和markdown？
**A:** 对话框中的内容需要保持纯文本格式，以确保：
1. 在不同设备和浏览器上显示一致
2. 便于用户复制和编辑
3. 避免格式解析问题

### Q2: 对话轮次限制是多少？
**A:** 最多支持5轮对话（10条消息：5条用户消息 + 5条AI回复）。达到限制后，用户需要点击"新建对话"开始新的创作。

### Q3: 如何快速创建新模块？
**A:** 按照本文档的5步法，从复制参考组件开始，逐步修改配置即可。关键是确保：
- 模板ID范围正确
- 欢迎消息符合规范
- API端点映射完整
- 数据库类型已添加

---

**文档版本：** v1.0
**最后更新：** 2026-02-11
**维护者：** Claude Sonnet 4.5
