# 小红书SEO关键词布局功能开发文档

## 📋 项目概述

本文档记录了为"秒懂AI超级写作员工"项目开发小红书SEO关键词布局功能的完整过程，包括需求分析、技术实现和测试方案。

**开发时间：** 2026-01-29
**功能模块：** 小红书SEO关键词布局表单收集与AI优化方案生成
**模板ID：** 105

---

## 🎯 需求分析

### 功能需求

根据系统提示词（小红书SEO关键词布局专家 v2.0），需要实现一个专门的表单页面，用于收集用户的账号信息和SEO痛点，并通过AI生成专业的SEO优化方案。

### 系统提示词要求

系统提示词定义了AI助手的角色和工作流程：

**角色定位：**
- 小红书SEO关键词布局专家
- 精通小红书平台SEO优化、关键词策略、内容营销、数据分析
- 擅长通过系统化的SEO优化策略提升笔记流量

**核心目标：**
1. 流量目标：帮助用户笔记实现自然搜索流量提升300%-500%
2. 排名目标：核心关键词搜索结果进入前10位，长尾词进入前3位
3. 互动目标：提升笔记点赞率至5%以上，收藏率至8%以上
4. 转化目标：通过精准SEO吸引高质量粉丝，粉丝转化率提升50%

**需要收集的信息：**
1. 📝 账号基本信息（内容类型、粉丝数、平均互动量、运营时长、发布频率）
2. 🎯 当前核心痛点（多选）
3. 🎯 优化目标
4. 📎 补充说明（可选：代表性笔记链接）

---

## 🏗️ 技术架构

### 前端技术栈

- **框架：** Next.js 16.0.10 (App Router)
- **UI组件：** shadcn/ui
- **语言：** TypeScript
- **样式：** Tailwind CSS

### 后端技术栈

- **API框架：** Next.js API Routes
- **AI服务：** DeepSeek API
- **环境变量管理：** .env.local

### 文件结构

```
components/
  └── xiaohongshu-writing-page.tsx    # 主页面组件（添加SEO表单）
app/
  └── api/
      └── xiaohongshu-seo/
          └── route.ts                 # SEO专用API路由
components/
  └── media-page.tsx                   # 媒体页面（已包含SEO入口）
.env.local                             # 环境变量配置
```

---

## 💻 实现过程

### 第一阶段：API路由创建

#### 1. 创建SEO专用API路由

在 `app/api/xiaohongshu-seo/route.ts` 中创建专用API端点：

```typescript
// 完整的系统提示词（小红书SEO关键词布局专家 v2.0）
const SYSTEM_PROMPT = `# 角色(Role): 小红书SEO关键词布局专家
...
`;

export async function POST(request: NextRequest) {
  // 接收用户输入的账号信息和痛点
  // 调用DeepSeek API生成SEO优化方案
  // 返回结构化的优化建议
}
```

**特点：**
- 完整的系统提示词（包含角色、背景、目标、约束、技能、规则、工作流等）
- 55秒超时控制
- 完善的错误处理

### 第二阶段：表单状态管理

#### 1. 添加SEO专用表单状态

在 `xiaohongshu-writing-page.tsx` 中添加状态变量：

```typescript
// SEO关键词布局专用表单状态
const [seoContentType, setSeoContentType] = useState(""); // 内容类型
const [seoFansCount, setSeoFansCount] = useState(""); // 粉丝数
const [seoInteractionRate, setSeoInteractionRate] = useState(""); // 平均互动量
const [seoOperationTime, setSeoOperationTime] = useState(""); // 运营时长
const [seoPostFrequency, setSeoPostFrequency] = useState(""); // 发布频率
const [seoPainPoints, setSeoPainPoints] = useState<string[]>([]); // 核心痛点(多选)
const [seoGoal, setSeoGoal] = useState(""); // 优化目标
```

### 第三阶段：表单验证与数据处理

#### 1. 添加表单验证逻辑

```typescript
if (templateId === "105") {
  // SEO关键词布局表单验证
  if (!seoContentType.trim()) {
    setError("请输入内容类型");
    return;
  }
  // ... 其他字段验证
  if (seoPainPoints.length === 0) {
    setError("请至少选择一个核心痛点");
    return;
  }
}
```

#### 2. 格式化表单数据

将表单数据组合成结构化的描述文本：

```typescript
const seoInfo = `1️⃣ 账号基本信息：
- 内容类型：${seoContentType}
- 粉丝数：${seoFansCount}
- 平均互动量：${seoInteractionRate}
- 运营时长：${seoOperationTime}
- 发布频率：${seoPostFrequency}

2️⃣ 当前核心痛点：
${painPointsText}

3️⃣ 优化目标：
${seoGoal}
${contentInput ? `\n补充说明：\n${contentInput}` : ""}`;
```

### 第四阶段：表单UI实现

#### 1. 实现SEO专用表单

根据模板ID（105）条件渲染专用表单：

```typescript
{templateId === "105" ? (
  <>
    {/* 内容类型 */}
    <Input placeholder="例如：美妆测评、职场干货..." />

    {/* 粉丝数 */}
    <Input placeholder="例如：500、2000、1万..." />

    {/* 核心痛点（多选） */}
    <div className="space-y-2">
      {painPointOptions.map((option) => (
        <label className="flex items-center space-x-2">
          <input type="checkbox" />
          <span>{option.label}</span>
        </label>
      ))}
    </div>

    {/* 优化目标 */}
    <Textarea placeholder="例如：月涨粉1000..." />
  </>
) : (
  // 其他模板的表单
)}
```

**表单字段：**
1. 📝 内容类型（必填）
2. 👥 粉丝数（必填）
3. 💬 平均互动量（必填）
4. ⏰ 运营时长（必填）
5. 📅 发布频率（必填）
6. 🎯 当前核心痛点（多选，必填）
   - 笔记曝光量低,自然流量少
   - 搜索来源占比不到10%
   - 某些关键词想做但一直排不上去
   - 不知道该布局哪些关键词
   - 写好的笔记不知道如何优化
7. 🎯 优化目标（必填）
8. 📎 补充说明（可选）

### 第五阶段：UI优化

#### 1. 自定义欢迎文本

```typescript
{templateId === "105"
  ? "🎯 你好！我是你的小红书SEO关键词布局专家，专注于帮助创作者通过科学的SEO策略，让优质内容获得它应得的流量和关注。准备好用SEO打开流量闸门了吗？🚀"
  : // 其他模板的欢迎文本
}
```

#### 2. 历史记录格式优化

```typescript
const contentForHistory = templateId === "105"
  ? `${seoContentType} | ${seoFansCount}粉丝 | ${seoPainPoints.length}个痛点`
  : // 其他模板的格式
```

---

## 📦 环境配置

### .env.local 配置

```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-3911af2ade114c229a46cb6fd1c434f4
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# 历史记录存储方式
NEXT_PUBLIC_USE_DATABASE=false
```

---

## 🚀 测试方案

### 本地测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问SEO功能页面**
   ```
   http://localhost:3000/writing/xiaohongshu?template=105&title=小红书SEO关键词布局&source=media-xiaohongshu
   ```

3. **填写测试数据**
   - 内容类型：美妆测评
   - 粉丝数：2000
   - 平均互动量：50赞10收藏
   - 运营时长：6个月
   - 发布频率：每周3篇
   - 核心痛点：选择2-3个
   - 优化目标：月涨粉1000，核心词排进前5

4. **提交生成**
   - 点击"智能创作"按钮
   - 等待AI生成结果（约10-20秒）

5. **验证结果**
   - 检查生成的SEO优化方案是否专业
   - 验证是否包含关键词挖掘、内容优化、标签策略等
   - 确认历史记录是否正确保存

### 功能测试清单

- [ ] 表单字段验证是否正常
- [ ] 多选框功能是否正常
- [ ] API调用是否成功
- [ ] AI生成的内容是否符合预期
- [ ] 历史记录是否正确保存
- [ ] 错误处理是否完善
- [ ] 响应式布局是否正常

---

## 📊 核心特性

### 1. 专业的系统提示词

- 完整的角色定义（背景、目标、约束、技能、规则）
- 五阶段工作流（诊断→关键词策略→内容优化→执行指导→长期陪跑）
- 结构化输出规范（Markdown格式、案例驱动、可操作性）

### 2. 智能表单设计

- 多维度信息收集（账号信息、痛点、目标）
- 多选框支持（核心痛点可多选）
- 可选补充说明（支持笔记链接）

### 3. 数据驱动优化

- 基于用户数据生成个性化方案
- 关键词挖掘和优先级排序
- 竞品分析和差异化建议

---

## 🎨 UI设计说明

### 表单布局

- **布局方式：** 垂直堆叠，单列布局
- **间距：** 使用 `space-y-4` 统一间距
- **标签样式：** 带红色星号标记必填字段，emoji图标增强可读性
- **输入框：** 使用 shadcn/ui 的 Input、Textarea 和 Checkbox 组件
- **提示文本：** 使用 placeholder 提供输入示例

### 视觉风格

- **主色调：** 保持与整体应用一致
- **表单元素：** 圆角、边框、阴影效果
- **多选框：** 清晰的选中状态，易于操作
- **错误提示：** 红色背景，清晰的错误信息

---

## 🔄 与其他功能的对比

| 功能 | 模板ID | 表单类型 | API端点 | 特点 |
|------|--------|----------|---------|------|
| 旅游攻略 | 101 | 结构化表单 | /api/travel-guide | 目的地、预算、同行人、天数、风格 |
| 账号简介 | 104 | 结构化表单 | /api/xiaohongshu-profile | 职业、内容方向、目标粉丝、人设 |
| **SEO布局** | **105** | **结构化表单+多选** | **/api/xiaohongshu-seo** | **账号信息、痛点多选、优化目标** |

---

## 📝 开发总结

### 成功要点

1. **参照现有模式**：完全参照旅游攻略和账号简介功能的实现模式
2. **完整的系统提示词**：包含角色、背景、目标、技能、规则、工作流等完整结构
3. **专业的表单设计**：多维度信息收集，支持多选框
4. **清晰的代码结构**：状态管理、验证逻辑、API调用、UI渲染分离

### 技术亮点

1. **多选框实现**：使用数组状态管理多个痛点选择
2. **数据格式化**：将表单数据组合成结构化的描述文本
3. **条件渲染**：根据模板ID渲染不同的表单和欢迎文本
4. **错误处理**：完善的表单验证和API错误处理

---

## 🎯 未来优化方向

### 功能增强

1. **笔记分析**：支持用户上传笔记链接，自动分析SEO问题
2. **关键词工具**：集成关键词搜索量和竞争度查询
3. **竞品分析**：自动分析同领域TOP笔记的SEO策略
4. **数据可视化**：展示关键词优先级矩阵图

### 用户体验

1. **智能推荐**：根据内容类型推荐热门关键词
2. **案例库**：提供不同垂类的SEO优化案例
3. **进度追踪**：记录用户的SEO优化进度和效果
4. **AB测试**：支持多个优化方案对比

---

## 👥 开发团队

- **开发者：** Claude Sonnet 4.5
- **开发时间：** 2026-01-29

---

## 📄 相关文档

- [小红书旅游攻略功能开发文档](./小红书旅游攻略功能开发文档.md)
- [系统提示词文档](../prompts/xiaohongshu-seo.md)

---

**文档版本：** 1.0
**最后更新：** 2026-01-29
