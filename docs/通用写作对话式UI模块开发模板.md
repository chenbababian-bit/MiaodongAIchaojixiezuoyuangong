# 通用写作对话式UI模块开发模板

## 📋 文档说明

本文档基于**演讲发言模块**的实际开发过程，提供了一个标准化的开发流程模板，适用于通用写作层级下所有需要对话式UI的功能模块。

**创建时间：** 2026-02-11
**参考案例：** 演讲发言模块 (1201-1212)
**适用范围：** 职场办公、政务公文等通用写作子模块

---

## 🎯 开发流程概览

```
1. 准备系统提示词 (用户提供)
   ↓
2. 创建组件文件 (复制+修改)
   ↓
3. 创建路由配置
   ↓
4. 添加自动重定向逻辑
   ↓
5. 更新数据库类型配置
   ↓
6. 创建API端点文件
   ↓
7. 测试和调试
   ↓
8. 提交到GitHub
```

---

## 📝 详细开发步骤

### 第一步：准备系统提示词

**目标：** 收集所有子功能的系统提示词

**操作：**
1. 确认模块的子功能数量和ID范围
2. 向用户索取每个子功能的系统提示词
3. 系统提示词应包含完整的Prompt结构（Role, Profile, Background, Goals, etc.）

**示例：** 演讲发言模块有12个子功能（1201-1212）

---

### 第二步：创建组件文件

**目标：** 基于参考模板创建新模块的对话式组件

#### 2.1 复制参考组件

```bash
# 复制report-writing-page.tsx作为基础
cp components/report-writing-page.tsx components/[新模块]-writing-page.tsx
```

#### 2.2 批量替换基础内容

```bash
# 替换组件名称
sed -i 's/ReportWritingPage/[新模块]WritingPage/g' components/[新模块]-writing-page.tsx

# 替换模块名称
sed -i 's/汇报总结/[新模块名称]/g' components/[新模块]-writing-page.tsx
```

⚠️ **重要警告：** 批量替换只会替换文本字符串，不会理解代码逻辑！

#### 2.3 手动修改关键部分

**必须手动检查和修改的3个关键位置：**

**位置1：初始化欢迎消息的useEffect（约第715行）**
```typescript
// ❌ 错误（批量替换后仍是旧ID）
const reportTemplateIds = ["1101", "1102", ..., "1112"];

// ✅ 正确（手动改为新模块的ID）
const speechesTemplateIds = ["1201", "1202", ..., "1212"];
```

**位置2：新建对话函数（约第970行）**
```typescript
// ❌ 错误
const reportTemplateIds = ["1101", "1102", ..., "1112"];

// ✅ 正确
const speechesTemplateIds = ["1201", "1202", ..., "1212"];
```

**位置3：主渲染逻辑的条件判断（约第990行）**
```typescript
// ❌ 错误
{["1101", "1102", ..., "1112"].includes(templateId) ? (

// ✅ 正确
{["1201", "1202", ..., "1212"].includes(templateId) ? (
```

#### 2.4 修改导入的模板数据

```typescript
// ❌ 错误
import { reportsTemplates } from "@/lib/general-templates";

// ✅ 正确
import { speechesTemplates } from "@/lib/general-templates";
```

#### 2.5 修改欢迎消息内容

```typescript
const getWelcomeMessage = (templateId: string): string => {
  const welcomeMessages: Record<string, string> = {
    "1201": `您好！我是您的专属入职欢迎辞专家...`,
    "1202": `您好！我是您的专属部门介绍演讲大师...`,
    // ... 其他12个欢迎消息
  };
  return welcomeMessages[templateId] || welcomeMessages["1201"];
};
```

**欢迎消息编写规范：**
- ✅ 使用纯文本格式
- ✅ 使用数字列表（1. 2. 3.）
- ✅ 使用短横线（-）表示列表项
- ✅ 清晰说明角色定位和能力
- ✅ 引导用户提供必要信息
- ❌ 避免使用过多emoji（可适当使用）
- ❌ 避免使用复杂的markdown格式
- ❌ **AI提问的第一句不要显示工作流程**（如"第一步：收集信息"等流程性描述应省略，直接以友好问候或引导性问题开始）

#### 2.6 修改API端点映射

```typescript
const getApiEndpoint = (templateId: string): string => {
  switch (templateId) {
    case "1201": return "/api/speeches/onboarding-welcome";
    case "1202": return "/api/speeches/department-intro";
    // ... 其他端点
    default: return "/api/speeches/onboarding-welcome";
  }
};
```

#### 2.7 修改类型映射函数

```typescript
// ❌ 错误（复制过来的旧函数）
const getReportTypeByTemplateId = (templateId: string): ConversationType => {
  const mapping: Record<string, ConversationType> = {
    '1101': 'report-work-summary',
    // ...
  };
  return mapping[templateId] || 'report-work-summary';
};

// ✅ 正确（改为新模块的映射）
const getSpeechesTypeByTemplateId = (templateId: string): ConversationType => {
  const mapping: Record<string, ConversationType> = {
    '1201': 'speeches-onboarding-welcome',
    '1202': 'speeches-department-intro',
    // ...
  };
  return mapping[templateId] || 'speeches-onboarding-welcome';
};
```

**然后批量替换函数调用：**
```bash
sed -i 's/getReportTypeByTemplateId/getSpeechesTypeByTemplateId/g' components/[新模块]-writing-page.tsx
```

#### 2.8 修改模板来源函数

```typescript
// 在getTemplatesFromSource函数中
switch (platform) {
  case "speeches":  // ✅ 改为新模块名
    return speechesTemplates.map((t: any) => ({  // ✅ 使用正确的模板
      id: t.id,
      icon: "speeches",  // ✅ 改为新模块的icon
      iconBg: t.color,
      title: t.title,
      desc: t.desc,
      active: false,
    }));
  // ... 其他case
}
```

#### 2.9 验证修改

```bash
# 搜索是否还有旧的模板ID
grep -n "1101.*1112\|1001.*1013" components/[新模块]-writing-page.tsx

# 搜索是否还有旧的模板引用
grep -n "reportsTemplates\|reportTemplateIds" components/[新模块]-writing-page.tsx

# 如果有输出，说明还有遗漏需要修改！
```

---

### 第三步：创建路由配置

**目标：** 为新模块创建专用路由

#### 3.1 创建路由目录

```bash
mkdir -p "app/writing/[新模块]"
```

#### 3.2 创建路由文件

**文件：** `app/writing/[新模块]/page.tsx`

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

### 第四步：添加自动重定向逻辑

**目标：** 让用户访问通用页面时自动跳转到对话式界面

**文件：** `components/general-writing-detail-page.tsx`

```typescript
// 在useEffect中添加新模块的重定向逻辑
useEffect(() => {
  const numId = parseInt(templateId);

  // 沟通协作模块 (1001-1013)
  if (numId >= 1001 && numId <= 1013) {
    const source = searchParams.get("source") || "general";
    router.replace(`/writing/communication?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
  }

  // 汇报总结模块 (1101-1112)
  if (numId >= 1101 && numId <= 1112) {
    const source = searchParams.get("source") || "general";
    router.replace(`/writing/report?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
  }

  // 演讲发言模块 (1201-1212) - 新增
  if (numId >= 1201 && numId <= 1212) {
    const source = searchParams.get("source") || "general";
    router.replace(`/writing/speeches?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
  }

  // 其他模块按需添加...
}, [templateId, templateTitle, router, searchParams]);
```

---

### 第五步：更新数据库类型配置

#### 5.1 更新TypeScript类型定义

**文件：** `lib/conversations.ts`

**添加新模块的类型定义：**
```typescript
// 演讲发言细粒度类型
export type SpeechesType =
  | 'speeches-onboarding-welcome'      // 1201: 入职欢迎辞
  | 'speeches-department-intro'        // 1202: 部门介绍演讲
  | 'speeches-project-kickoff'         // 1203: 项目启动演讲
  // ... 其他类型
  | 'speeches-probation-review';       // 1212: 转正述职报告演讲稿
```

**更新ConversationType联合类型：**
```typescript
export type ConversationType =
  'qa' | 'role' |
  XiaohongshuType | WechatType | ToutiaoType |
  WeiboType | ZhihuType | VideoType |
  PrivateType | KuaishouType | DouyinType |
  DataAnalysisType | LiveStreamingType |
  ReportType | SpeechesType;  // 新增
```

**添加模板ID到对话类型的映射函数：**
```typescript
export function getSpeechesTypeByTemplateId(templateId: number): SpeechesType {
  const templateMap: Record<number, SpeechesType> = {
    1201: 'speeches-onboarding-welcome',
    1202: 'speeches-department-intro',
    // ... 其他映射
  };

  const type = templateMap[templateId];
  if (!type) {
    console.warn(`未知的演讲发言模板ID: ${templateId}，使用默认类型`);
    return 'speeches-onboarding-welcome';
  }

  return type;
}
```

#### 5.2 创建数据库迁移文件

**文件：** `supabase/migrations/[timestamp]_add_[module]_type.sql`

```sql
-- 添加新模块类型到conversations表的CHECK约束
ALTER TABLE conversations
DROP CONSTRAINT IF EXISTS conversations_type_check;

ALTER TABLE conversations
ADD CONSTRAINT conversations_type_check
CHECK (type IN (
  'qa', 'role',
  -- 小红书类型
  'xiaohongshu-travel',
  'xiaohongshu-copywriting',
  -- ... 其他已有类型

  -- 演讲发言类型（新增）
  'speeches-onboarding-welcome',
  'speeches-department-intro',
  'speeches-project-kickoff',
  'speeches-team-building-opening',
  'speeches-year-end-summary',
  'speeches-annual-meeting',
  'speeches-award-ceremony',
  'speeches-retirement-farewell',
  'speeches-sales-motivation',
  'speeches-culture-promotion',
  'speeches-onboarding-speech',
  'speeches-probation-review'
));
```

---

### 第六步：创建API端点文件

**目标：** 为每个子功能创建独立的API端点

#### 6.1 创建API目录结构

```bash
mkdir -p "app/api/[新模块]"
```

#### 6.2 创建API端点文件

**文件：** `app/api/[新模块]/[子功能]/route.ts`

**标准模板：**
```typescript
import { NextRequest, NextResponse } from "next/server";

// 系统提示词（从用户提供的Prompt中获取）
const SYSTEM_PROMPT = `
# Role: [角色名称]

## Profile
- author: 呱呱
- version: 1.0
- language: 中文
- wxid: pluto2596
- description: [角色描述]

## Background
[背景说明]

## Goals
[目标列表]

## Constrains
[约束条件]

## Skills
[技能列表]

## Rules
[规则列表]

## Workflow
[工作流程]
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

#### 6.3 批量创建API端点

对于有多个子功能的模块，需要为每个子功能创建独立的API端点文件。

**示例：** 演讲发言模块需要创建12个API端点文件：
- `/api/speeches/onboarding-welcome/route.ts`
- `/api/speeches/department-intro/route.ts`
- `/api/speeches/project-kickoff/route.ts`
- ... 等等

---

### 第七步：测试和调试

#### 7.1 运行TypeScript类型检查

```bash
npx tsc --noEmit --pretty
```

**常见错误：**
1. ❌ `Cannot find name 'reportsTemplates'` - 模板引用错误
2. ❌ `Cannot find name 'getReportTypeByTemplateId'` - 函数名未更新
3. ❌ 类型不匹配 - 检查ConversationType定义

#### 7.2 本地测试

```bash
npm run dev
```

**测试清单：**
- [ ] 访问 `/writing/general?template=[ID]` 能否自动重定向
- [ ] 对话式UI界面是否正常显示
- [ ] 欢迎消息是否正确显示
- [ ] 输入框是否支持Enter发送、Shift+Enter换行
- [ ] 多轮对话是否正常工作（最多5轮）
- [ ] 新建对话功能是否正常
- [ ] 历史记录功能是否正常
- [ ] 富文本编辑器是否正常显示结果
- [ ] 复制功能是否正常

---

### 第八步：提交到GitHub

#### 8.1 添加文件到暂存区

```bash
git add components/[新模块]-writing-page.tsx \
        app/writing/[新模块]/ \
        app/api/[新模块]/ \
        components/general-writing-detail-page.tsx \
        lib/conversations.ts \
        supabase/migrations/[timestamp]_add_[module]_type.sql
```

#### 8.2 创建提交

```bash
git commit -m "$(cat <<'EOF'
feat([新模块]): 添加[新模块]对话式UI框架

- 创建[新模块]-writing-page.tsx组件，支持N个子类型
- 添加路由配置 app/writing/[新模块]/page.tsx
- 在general-writing-detail-page.tsx中添加自动重定向逻辑
- 更新数据库类型配置：
  - 添加[新模块]Type类型定义
  - 更新ConversationType联合类型
  - 添加get[新模块]TypeByTemplateId映射函数
- 创建SQL迁移文件添加[新模块]对话类型
- 创建第1个API端点：[子功能名称]

模块包含N个子类型：
1. [子功能1] (ID1)
2. [子功能2] (ID2)
...

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

#### 8.3 推送到远程仓库

```bash
git push
```

#### 8.4 监控Vercel部署

访问Vercel Dashboard查看部署状态，确保构建成功。

---

## 🐛 常见问题和解决方案

### 问题1：Vercel部署失败 - TypeScript类型错误

**错误信息：**
```
Cannot find name 'reportsTemplates'
```

**原因：** 批量替换后遗漏了某些引用

**解决方案：**
```bash
# 搜索所有可能的旧引用
grep -rn "reportsTemplates\|reportTemplateIds\|getReportTypeByTemplateId" components/[新模块]-writing-page.tsx

# 手动修改所有找到的位置
```

### 问题2：类型映射函数错误

**错误信息：**
```
Type 'report-work-summary' is not assignable to type 'ConversationType'
```

**原因：** 类型映射函数返回了错误的类型

**解决方案：**
确保类型映射函数返回正确的类型：
```typescript
// ❌ 错误
return 'report-work-summary';

// ✅ 正确
return 'speeches-onboarding-welcome';
```

### 问题3：模板来源函数引用错误

**错误信息：**
```
Cannot find name 'reportsTemplates'
```

**原因：** getTemplatesFromSource函数中的switch case未更新

**解决方案：**
```typescript
// 修改switch case
case "speeches":  // 改为新模块名
  return speechesTemplates.map((t: any) => ({  // 使用正确的模板
```

### 问题4：点击功能后闪烁旧页面再跳转到对话式UI

**现象：** 用户点击功能卡片后，会先短暂显示通用页面（general-writing-detail-page），然后才跳转到对话式UI页面，造成页面闪烁。

**原因：** 在 `general-writing-page.tsx` 的 `handleTemplateClick` 函数中，新模块的卡片点击后会先跳转到 `/writing/general` 页面，然后在 `general-writing-detail-page.tsx` 的 `useEffect` 中检测到模块ID后再重定向到对话式UI页面，导致两次页面跳转。

**解决方案：**

在 `components/general-writing-page.tsx` 的 `handleTemplateClick` 函数中，为新模块添加直接跳转逻辑：

```typescript
// 处理模板点击
const handleTemplateClick = (templateId: number, title: string) => {
  // 检测是否为沟通协作模板（1001-1013），直接跳转到对话式界面
  if (templateId >= 1001 && templateId <= 1013) {
    router.push(
      `/writing/communication?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
    );
  }
  // 检测是否为汇报总结模板（1101-1112），跳转到汇报总结对话式界面
  else if (templateId >= 1101 && templateId <= 1112) {
    router.push(
      `/writing/report?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
    );
  }
  // 检测是否为演讲发言模块（1201-1212），跳转到演讲发言对话式界面
  else if (templateId >= 1201 && templateId <= 1212) {
    router.push(
      `/writing/speeches?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
    );
  } else {
    router.push(
      `/writing/general?template=${templateId}&title=${encodeURIComponent(title)}`
    );
  }
};
```

**关键点：**
- 在卡片点击时直接判断模块ID范围，跳转到对应的对话式UI页面
- 避免先跳转到通用页面再重定向，减少页面跳转次数
- 保持 `general-writing-detail-page.tsx` 中的重定向逻辑作为兜底方案

---

## ✅ 开发检查清单

### 组件文件检查
- [ ] 组件名称已更新（[新模块]WritingPage）
- [ ] 模板ID数组已更新（3个位置）
- [ ] 导入的模板数据已更新（speechesTemplates）
- [ ] 欢迎消息已更新（12个子功能）
- [ ] API端点映射已更新
- [ ] 类型映射函数已更新（函数名和映射内容）
- [ ] 模板来源函数已更新（switch case）

### 路由配置检查
- [ ] 路由目录已创建
- [ ] 路由文件已创建
- [ ] 组件导入正确

### 重定向逻辑检查
- [ ] general-writing-detail-page.tsx已添加重定向
- [ ] ID范围正确
- [ ] 路由路径正确

### 数据库配置检查
- [ ] TypeScript类型定义已添加
- [ ] ConversationType已更新
- [ ] 映射函数已添加
- [ ] SQL迁移文件已创建

### API端点检查
- [ ] API目录已创建
- [ ] 至少创建了第1个API端点
- [ ] 系统提示词已正确填入

### 测试检查
- [ ] TypeScript类型检查通过
- [ ] 本地测试通过
- [ ] Vercel部署成功

---

## 📊 开发时间估算

| 步骤 | 预计时间 | 说明 |
|------|---------|------|
| 准备系统提示词 | 用户提供 | 需要用户提供完整的Prompt |
| 创建组件文件 | 30分钟 | 包括复制、批量替换、手动修改 |
| 创建路由配置 | 5分钟 | 简单的文件创建 |
| 添加重定向逻辑 | 5分钟 | 在现有文件中添加几行代码 |
| 更新数据库配置 | 15分钟 | TypeScript类型和SQL迁移 |
| 创建第1个API端点 | 10分钟 | 后续端点可批量创建 |
| 测试和调试 | 20分钟 | 类型检查、本地测试 |
| 提交到GitHub | 5分钟 | Git操作 |
| **总计** | **约90分钟** | 不包括等待用户提供系统提示词的时间 |

---

## 🔄 后续优化建议

1. **自动化脚本：** 创建一个脚本自动执行批量替换和文件创建
2. **模板生成器：** 开发一个CLI工具，输入模块信息自动生成所有文件
3. **测试自动化：** 添加单元测试和集成测试
4. **文档生成：** 自动生成API文档和用户手册

---

## 📚 参考资源

- [对话式UI模块开发流程标准](./对话式UI模块开发流程标准.md)
- [小红书模块开发规范](./小红书模块开发规范.md)
- [数据库快速参考](../DATABASE_QUICK_REFERENCE.md)

---

**文档版本：** v1.0
**最后更新：** 2026-02-11
**维护者：** Claude Sonnet 4.5

**更新日志：**
- v1.0 (2026-02-11): 基于演讲发言模块开发过程创建初始版本
