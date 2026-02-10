# 会议邀请函对话式UI制作流程文档

## 📋 项目概述

**项目名称：** 会议邀请函对话式UI改造
**完成日期：** 2026-02-11
**负责人：** Claude Sonnet 4.5
**项目目标：** 将会议邀请函等13个沟通协作模板从传统表单界面改造为对话式交互界面

## 🎯 项目背景

### 原有问题
- 传统表单界面交互体验不够友好
- 用户需要一次性填写所有信息，缺乏引导
- 与小红书模块的对话式界面体验不一致

### 改造目标
- 实现对话式交互界面，提升用户体验
- 支持多轮对话（最多5轮），逐步引导用户完成内容创作
- 与小红书模块保持一致的UI和交互逻辑
- 支持所有13个沟通协作子类型（templateId: 1001-1013）

## 🏗️ 技术方案

### 架构设计

```
用户访问 /writing/general?template=1001
    ↓
GeneralWritingDetailPage 检测 templateId
    ↓
自动重定向到 /writing/communication?template=1001
    ↓
CommunicationWritingPage 渲染对话式界面
    ↓
左侧对话区 (50%) | 右侧编辑器 (50%)
```

### 核心组件

1. **CommunicationWritingPage** (`components/communication-writing-page.tsx`)
   - 主要的对话式UI组件
   - 支持13个沟通协作子类型
   - 包含消息列表、输入框、历史记录等功能

2. **GeneralWritingDetailPage** (`components/general-writing-detail-page.tsx`)
   - 通用写作页面
   - 添加重定向逻辑，检测沟通协作模板并重定向

3. **路由配置** (`app/writing/communication/page.tsx`)
   - 新增沟通协作专用路由

## 📝 实现步骤

### 第一步：分析参考模板

**目标：** 了解小红书模块的对话式界面实现逻辑

**操作：**
```bash
# 读取小红书模块组件
Read components/xiaohongshu-writing-page.tsx
```

**关键发现：**
- 使用左右50/50分栏布局
- 左侧：对话消息区域 + 底部输入框
- 右侧：富文本编辑器 / 历史记录
- 支持多轮对话，最多5轮
- 使用MessageBubble组件显示消息
- 输入框高度自适应（60px-150px）

### 第二步：创建新组件

**目标：** 基于小红书模块创建沟通协作组件

**操作：**
```bash
# 创建新的组件文件
cp components/xiaohongshu-writing-page.tsx components/communication-writing-page.tsx

# 修改组件名称和相关引用
- XiaohongshuWritingPage → CommunicationWritingPage
- xiaohongshu → communication
```

**关键修改：**

1. **条件判断更新** (第855行)
```typescript
{["101", "102", "103", "104", "105", "106", "107", "108",
  "1001", "1002", "1003", "1004", "1005", "1006", "1007",
  "1008", "1009", "1010", "1011", "1012", "1013"].includes(templateId) ? (
  // 对话式UI
) : (
  // 传统表单UI
)}
```

2. **欢迎消息配置** (第545-574行)
```typescript
const getWelcomeMessage = (templateId: string): string => {
  const welcomeMessages: Record<string, string> = {
    "1001": `您好！我是您的专业会议邀请函撰写助手 📧

我擅长撰写各类正式、专业的会议邀请函，确保信息准确、格式规范、语气得体。

请告诉我以下信息：
1. 会议主题：这次会议的主要议题是什么？
2. 会议时间：具体的日期和时间
3. 会议地点：线上还是线下？具体地址或会议链接
4. 参会对象：邀请哪些人参加？
5. 其他要求：是否需要回复确认、着装要求等

让我们开始创作一份专业的会议邀请函吧！✨`,
    // ... 其他12个模板的欢迎消息
  };
  return welcomeMessages[templateId] || welcomeMessages["1001"];
};
```

3. **API端点映射** (第649-666行)
```typescript
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "1001": return "/api/communication/meeting-invitation";
    case "1002": return "/api/communication/meeting-minutes";
    // ... 其他11个端点
    default: return "/api/communication/meeting-invitation";
  }
};
```

4. **新建对话函数** (第816-837行)
```typescript
const handleCommunicationNewConversation = () => {
  setConversationHistory([]);
  setCurrentResult("");
  setError("");
  setCurrentConversationId(null);
  setInputValue("");

  const communicationTemplateIds = ["1001", "1002", ..., "1013"];
  if (communicationTemplateIds.includes(templateId)) {
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

### 第三步：创建路由配置

**目标：** 为沟通协作模块创建专用路由

**操作：**
```bash
# 创建路由目录和文件
mkdir -p app/writing/communication
```

**文件内容：** `app/writing/communication/page.tsx`
```typescript
import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { CommunicationWritingPage } from "@/components/communication-writing-page";

export default function CommunicationPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <CommunicationWritingPage />
      </Suspense>
    </AppLayout>
  );
}
```

### 第四步：添加自动重定向

**目标：** 让用户访问 `/writing/general?template=1001` 时自动跳转到对话式界面

**操作：**
修改 `components/general-writing-detail-page.tsx`

**关键代码：** (第247-256行)
```typescript
export function GeneralWritingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "通用写作";
  const templateId = searchParams.get("template") || "1001";

  // 检测是否为沟通协作模板（1001-1013），如果是则重定向到对话式界面
  useEffect(() => {
    const numId = parseInt(templateId);
    if (numId >= 1001 && numId <= 1013) {
      const source = searchParams.get("source") || "general";
      router.replace(`/writing/communication?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
    }
  }, [templateId, templateTitle, router, searchParams]);

  // ... 其余代码
}
```

### 第五步：测试和部署

**测试清单：**
- [x] 访问 `/writing/general?template=1001` 能否自动重定向
- [x] 对话式界面是否正常显示
- [x] 欢迎消息是否正确显示
- [x] 输入框是否支持Enter发送、Shift+Enter换行
- [x] 输入框高度是否自适应
- [x] 多轮对话是否正常工作
- [x] 新建对话功能是否正常
- [x] 历史记录功能是否正常
- [x] 富文本编辑器是否正常显示结果

**部署步骤：**
```bash
# 1. 添加新文件到git
git add app/writing/communication/ components/communication-writing-page.tsx

# 2. 提交改动
git commit -m "feat(communication): 实现会议邀请函对话式UI界面"

# 3. 添加重定向逻辑
git add components/general-writing-detail-page.tsx
git commit -m "fix(communication): 添加沟通协作模板自动重定向到对话式界面"

# 4. 推送到远程仓库
git push
```

## 🎨 UI设计说明

### 布局结构

```
┌─────────────────────────────────────────────────────────────┐
│  返回  会议邀请函    新建对话  历史记录    文本编辑器  复制  │
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

### 交互流程

1. **初始状态**
   - 显示AI欢迎消息
   - 引导用户输入必要信息
   - 输入框处于激活状态

2. **用户输入**
   - 输入框高度自适应（60px-150px）
   - Enter发送，Shift+Enter换行
   - 显示对话轮次（0/5）

3. **AI回复**
   - 显示加载动画
   - 流式显示AI回复
   - 自动同步到右侧编辑器

4. **继续对话**
   - 支持最多5轮对话
   - 可以随时新建对话
   - 可以查看历史记录

## 📊 关键数据

### 支持的模板列表

| ID   | 模板名称       | API端点                                    |
|------|----------------|-------------------------------------------|
| 1001 | 会议邀请函     | /api/communication/meeting-invitation     |
| 1002 | 会议纪要       | /api/communication/meeting-minutes        |
| 1003 | 工作邮件       | /api/communication/work-email             |
| 1004 | 内部通知       | /api/communication/internal-notice        |
| 1005 | 外部通知       | /api/communication/external-notice        |
| 1006 | 客户反馈报告   | /api/communication/customer-feedback      |
| 1007 | 员工满意度调查 | /api/communication/employee-satisfaction  |
| 1008 | 紧急情况联络表 | /api/communication/emergency-contact      |
| 1009 | 日常工作报告   | /api/communication/daily-report           |
| 1010 | 问题解决报告   | /api/communication/problem-solving        |
| 1011 | 建议书         | /api/communication/proposal               |
| 1012 | 感谢信         | /api/communication/thank-you-letter       |
| 1013 | 道歉信         | /api/communication/apology-letter         |

### 代码统计

- **新增文件：** 2个
  - `app/writing/communication/page.tsx` (13行)
  - `components/communication-writing-page.tsx` (1595行)
- **修改文件：** 1个
  - `components/general-writing-detail-page.tsx` (+10行)
- **总代码量：** 1618行

## 🔧 技术栈

- **框架：** Next.js 14 (App Router)
- **UI库：** React 18 + TypeScript
- **组件库：** shadcn/ui
- **样式：** Tailwind CSS
- **状态管理：** React Hooks (useState, useEffect, useRef)
- **路由：** Next.js App Router
- **数据库：** Supabase (用于历史记录)

## 📚 核心功能实现

### 1. 对话历史管理

```typescript
const [conversationHistory, setConversationHistory] = useState<
  Array<{ role: "user" | "assistant"; content: string }>
>([]);

// 更新对话历史
setConversationHistory(prev => [
  ...prev,
  { role: 'user', content: userContent },
  { role: 'assistant', content: data.result }
]);
```

### 2. 消息显示

```typescript
const [messages, setMessages] = useState<Array<{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCollapsed: boolean;
}>>([]);

// 添加消息
setMessages(prev => [...prev, {
  id: Date.now().toString(),
  role: 'user',
  content: userContent,
  isCollapsed: false
}]);
```

### 3. 输入框高度自适应

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setInputValue(e.target.value);

  const target = e.target;
  target.style.height = '60px';

  const scrollHeight = target.scrollHeight;
  const newHeight = Math.min(Math.max(scrollHeight, 60), 150);
  setInputHeight(newHeight);
  target.style.height = `${newHeight}px`;
};
```

### 4. 历史记录保存

```typescript
// 自动创建对话并保存
if (userId && !currentConversationId) {
  const title = userContent.slice(0, 30) + (userContent.length > 30 ? '...' : '');
  const conversationType = getXiaohongshuTypeByTemplateId(activeTemplate);
  const convId = await createConversation(userId, title, conversationType);
  setCurrentConversationId(convId);

  await addMessage(convId, 'user', userContent);
  await addMessage(convId, 'assistant', data.result);
}
```

## 🐛 常见问题

### Q1: 为什么访问 `/writing/general?template=1001` 会重定向？

**A:** 为了保持URL的一致性，我们在 `GeneralWritingDetailPage` 中添加了检测逻辑。当检测到templateId在1001-1013范围内时，自动重定向到 `/writing/communication` 路径，确保用户看到对话式界面。

### Q2: 如何添加新的沟通协作模板？

**A:** 需要修改以下几个地方：
1. 在 `getWelcomeMessage` 函数中添加新的欢迎消息
2. 在 `getApiEndpoint` 函数中添加新的API端点
3. 在条件判断中添加新的templateId
4. 在 `handleCommunicationNewConversation` 中添加新的templateId

### Q3: 对话轮次限制是多少？

**A:** 最多支持5轮对话（10条消息：5条用户消息 + 5条AI回复）。达到限制后，用户需要点击"新建对话"开始新的创作。

## 📈 性能优化

1. **懒加载：** 使用 `Suspense` 组件实现路由级别的懒加载
2. **状态管理：** 使用 React Hooks 进行轻量级状态管理
3. **消息渲染：** 使用 `MessageBubble` 组件复用，减少重复渲染
4. **输入防抖：** 输入框高度计算使用实时更新，无需防抖

## 🎯 未来优化方向

1. **语音输入：** 支持语音转文字输入
2. **模板推荐：** 根据用户输入智能推荐相关模板
3. **批量生成：** 支持一次生成多个版本供用户选择
4. **导出功能：** 支持导出为Word、PDF等格式
5. **协作功能：** 支持多人协作编辑

## 📝 提交记录

### Commit 1: feat(communication): 实现会议邀请函对话式UI界面
```
- 将会议邀请函从传统表单界面改造为对话式交互界面
- 采用左右50/50分栏布局，左侧对话区，右侧编辑器
- 支持多轮对话（最多5轮），实时显示对话轮次
- 添加AI欢迎消息，引导用户输入必要信息
- 支持Enter发送、Shift+Enter换行，输入框高度自适应
- 实现新建对话、历史记录查看和恢复功能
- 与小红书模块保持一致的交互体验
- 支持所有13个沟通协作子类型的对话式界面

Commit Hash: 459180b
```

### Commit 2: fix(communication): 添加沟通协作模板自动重定向到对话式界面
```
- 在GeneralWritingDetailPage中检测templateId 1001-1013
- 自动重定向到/writing/communication路径
- 确保用户访问会议邀请函等模板时看到对话式界面
- 保持URL参数的完整传递

Commit Hash: b066f99
```

## 👥 团队协作

**开发人员：** Claude Sonnet 4.5
**审核人员：** 用户
**测试人员：** 用户
**部署平台：** Vercel

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: [项目仓库](https://github.com/chenbababian-bit/MiaodongAIchaojixiezuoyuangong)
- 项目文档：本文档

---

**文档版本：** v1.0
**最后更新：** 2026-02-11
**维护者：** Claude Sonnet 4.5
