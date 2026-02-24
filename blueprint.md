# 妙懂 AI 写作平台 - 项目开发蓝图

> 最后更新：2026-02-24
> 项目定位：面向职场人士和企业的"全职业办公写作生产力工具"

---

## 项目现状概览

### 已完成模块
- ✅ 技术栈搭建（Next.js 16 + React 19 + TypeScript + Tailwind + shadcn/ui）
- ✅ 数据库集成（Supabase）
- ✅ 用户认证（Google 登录）
- ✅ 积分系统后端逻辑（扣费、记录、余额查询）
- ✅ 100+ 写作模板 API
- ✅ 对话历史存储
- ✅ 主界面 UI

### 待开发模块（本蓝图重点）
- ❌ 用户中心页面
- ❌ 积分余额前端显示
- ❌ 充值/支付功能
- ❌ 消费记录页面
- ❌ 我的文档页面
- ❌ 导出功能

---

## 开发任务清单

### 阶段一：用户中心基础建设（Task 1-4）

---

#### Task 1: 创建用户中心页面布局

**目标**：搭建用户中心的基础页面框架，让用户能够访问 `/account` 路径看到自己的账户页面。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/page.tsx` | 用户中心主页面，展示积分余额、快捷操作入口 |
| `app/account/layout.tsx` | 用户中心的布局文件，包含侧边导航（积分、消费记录、设置等标签页） |
| `components/account/account-sidebar.tsx` | 用户中心左侧导航组件，包含"账户概览"、"消费记录"、"个人设置"等菜单项 |

**逻辑说明**：
1. 用户点击顶部导航栏的头像或"我的账户"按钮
2. 跳转到 `/account` 页面
3. 页面左侧显示导航菜单，右侧显示具体内容
4. 默认显示"账户概览"，包含积分余额大卡片

**设计要点**：
- 页面需要检查用户是否已登录，未登录则跳转到登录页
- 布局采用左右分栏：左侧导航宽度约 200px，右侧为内容区
- 整体风格与现有 `app-sidebar.tsx` 保持一致

---

#### Task 2: 创建积分余额显示组件

**目标**：在用户中心首页显示用户当前积分余额、累计获得、累计消费。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `components/account/credits-overview-card.tsx` | 积分概览卡片组件，大号数字显示当前余额 |
| `app/api/user/credits/route.ts` | 获取当前用户积分余额的 API 接口 |
| `hooks/use-credits.ts` | 前端获取积分的自定义 Hook，方便多处复用 |

**逻辑说明**：
1. 用户进入账户页面时，前端调用 `/api/user/credits` 接口
2. 后端通过 Supabase 查询 `user_credits` 表，返回用户的 `balance`、`total_earned`、`total_consumed`
3. 前端用卡片组件展示：
   - 当前余额（大号醒目数字）
   - 累计获得（小字）
   - 累计消费（小字）
4. 卡片右侧放一个"去充值"按钮

**数据来源**：
- 已有的 `lib/credits.ts` 中的 `getUserCredits()` 函数
- 数据库表：`user_credits`

---

#### Task 3: 在全局顶栏添加积分显示

**目标**：让用户在任何页面都能看到自己的积分余额，不用专门进入账户页面。

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `components/app-layout.tsx` | 在顶部导航栏右侧添加积分显示区域 |
| `components/header/user-credits-badge.tsx`（新建） | 积分徽章组件，显示小图标+数字 |

**逻辑说明**：
1. 在页面顶部导航栏的右侧（用户头像旁边），添加一个积分显示区域
2. 显示格式：`💰 125 积分` 或类似样式
3. 点击可以快速跳转到充值页面
4. 使用 Task 2 中创建的 `use-credits` Hook 获取数据

**设计要点**：
- 积分不足时（比如小于 10），可以用红色或警告色提醒
- 组件应该有加载状态（skeleton）
- 未登录用户不显示此组件

---

#### Task 4: 创建消费记录页面

**目标**：让用户能够查看自己的所有积分消费明细。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/transactions/page.tsx` | 消费记录页面，表格展示所有交易 |
| `components/account/transactions-table.tsx` | 消费记录表格组件 |
| `app/api/user/transactions/route.ts` | 获取用户消费记录的 API 接口 |

**逻辑说明**：
1. 用户点击用户中心侧边栏的"消费记录"菜单
2. 页面调用 `/api/user/transactions` 获取数据
3. 后端查询 `credit_transactions` 表，按时间倒序返回
4. 前端用表格展示：
   - 时间
   - 类型（消费/充值/赠送）
   - 描述（如"小红书爆款文案消费"）
   - 积分变动（+100 或 -5）
   - 余额

**分页逻辑**：
- 默认每页显示 20 条
- 支持"加载更多"或分页按钮

**数据来源**：
- 已有的 `lib/credits.ts` 中的 `getTransactionHistory()` 函数
- 数据库表：`credit_transactions`

---

### 阶段二：充值支付系统（Task 5-8）

---

#### Task 5: 创建充值套餐配置

**目标**：定义充值套餐（比如 10元=100积分），方便后续展示和计算。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `config/pricing.ts` | 充值套餐配置文件，定义所有套餐 |

**配置内容说明**：
```
套餐数组，每个套餐包含：
- id: 套餐唯一标识
- name: 套餐名称（如"入门包"）
- price: 价格（单位：元）
- credits: 获得积分数
- bonus: 赠送积分（可选）
- popular: 是否为推荐套餐（用于UI高亮）
```

**示例套餐设计**：
1. 体验包：1元 = 10积分
2. 入门包：10元 = 100积分
3. 标准包：50元 = 550积分（多送50）
4. 专业包：100元 = 1200积分（多送200）
5. 企业包：500元 = 6500积分（多送1500）

---

#### Task 6: 创建充值页面 UI

**目标**：让用户选择充值套餐并发起支付。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/recharge/page.tsx` | 充值页面 |
| `components/account/pricing-card.tsx` | 单个套餐卡片组件 |
| `components/account/pricing-grid.tsx` | 套餐网格布局组件 |

**逻辑说明**：
1. 页面顶部显示当前积分余额
2. 下方展示所有充值套餐（卡片网格）
3. 用户点击某个套餐，卡片高亮选中
4. 点击"立即充值"按钮，发起支付流程

**设计要点**：
- 推荐套餐加上"最划算"标签
- 卡片显示：价格、积分数、赠送积分（如果有）
- 底部显示支付方式选择（微信/支付宝）

---

#### Task 7: 对接支付接口（后端）

**目标**：创建支付订单，对接第三方支付平台。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/api/payment/create/route.ts` | 创建支付订单的 API |
| `app/api/payment/callback/route.ts` | 支付成功后的回调 API |
| `lib/payment.ts` | 支付相关工具函数（签名、验签等） |

**逻辑说明**：

**创建订单流程**：
1. 前端发送请求：选择的套餐 ID、支付方式
2. 后端生成唯一订单号
3. 调用支付平台 API 创建预支付订单
4. 返回支付链接/二维码给前端

**支付回调流程**：
1. 用户支付成功后，支付平台调用我们的回调接口
2. 验证签名，确认是真实的支付通知
3. 查询订单，确认金额匹配
4. 调用 `lib/credits.ts` 的 `rechargeCredits()` 函数，给用户加积分
5. 更新订单状态为"已完成"

**支付平台选择建议**：
- 个人开发者：虎皮椒、PayJS（无需企业资质）
- 企业：微信支付、支付宝官方

---

#### Task 8: 创建订单记录表和页面

**目标**：记录用户的充值订单，支持查询。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/orders/page.tsx` | 订单记录页面 |
| `components/account/orders-table.tsx` | 订单表格组件 |

**数据库设计**（需在 Supabase 创建）：
```
表名：orders
字段：
- id: 主键
- user_id: 用户ID
- order_no: 订单号
- package_id: 套餐ID
- amount: 支付金额（分）
- credits: 获得积分
- status: 订单状态（pending/paid/failed/refunded）
- payment_method: 支付方式
- paid_at: 支付时间
- created_at: 创建时间
```

**页面逻辑**：
- 展示用户所有充值订单
- 显示订单状态（待支付/已完成/已取消）
- 可以查看订单详情

---

### 阶段三：我的文档系统（Task 9-11）

---

#### Task 9: 创建我的文档页面

**目标**：让用户查看自己生成过的所有文档。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/documents/page.tsx` | 我的文档列表页面 |
| `components/documents/document-card.tsx` | 文档卡片组件 |
| `components/documents/document-list.tsx` | 文档列表组件 |

**逻辑说明**：
1. 用户点击侧边栏"我的文档"（需要在 `app-sidebar.tsx` 添加入口）
2. 页面调用 API 获取用户的所有对话/文档
3. 按时间倒序展示，每个卡片显示：
   - 标题（或内容前30字）
   - 模板类型（如"小红书爆款文案"）
   - 创建时间
   - 操作按钮（查看、删除）

**数据来源**：
- 已有的 `lib/conversations.ts` 中的 `getConversations()` 函数
- 数据库表：`conversations`

---

#### Task 10: 创建文档详情页面

**目标**：让用户查看某个文档的完整内容，并可以继续对话修改。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/documents/[id]/page.tsx` | 文档详情页面（动态路由） |
| `components/documents/document-viewer.tsx` | 文档内容查看器 |
| `components/documents/document-chat.tsx` | 对话修改面板 |

**逻辑说明**：
1. 用户点击某个文档卡片
2. 跳转到 `/documents/[id]` 页面
3. 页面分为两栏：
   - 左侧：文档内容展示（可复制）
   - 右侧：对话历史 + 输入框（继续对话修改）
4. 用户可以发送新消息，AI 返回修改后的内容
5. 修改后自动保存到数据库

**数据来源**：
- 已有的 `getConversationWithMessages()` 函数
- 数据库表：`conversations` + `messages`

---

#### Task 11: 添加文档导出功能

**目标**：让用户能够将生成的内容导出为 Word 或复制到剪贴板。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `lib/export.ts` | 导出工具函数 |
| `components/documents/export-button.tsx` | 导出按钮组件（下拉菜单） |

**逻辑说明**：

**复制到剪贴板**：
1. 使用浏览器 Clipboard API
2. 复制成功后显示 toast 提示

**导出为 Word**：
1. 使用 `docx` 库生成 Word 文档
2. 触发浏览器下载

**导出为纯文本**：
1. 生成 .txt 文件
2. 触发下载

**需要安装的依赖**：
- `docx`：生成 Word 文档
- `file-saver`：触发文件下载

---

### 阶段四：体验优化（Task 12-14）

---

#### Task 12: 添加侧边栏入口

**目标**：在主侧边栏添加"我的文档"和"账户"入口。

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `components/app-sidebar.tsx` | 添加"我的文档"和"账户"导航项 |

**修改内容**：
1. 在 `navItems` 数组中添加两个新项：
   - 图标：FileText，标签："我的文档"，路径："/documents"
   - 图标：User，标签："账户"，路径："/account"
2. 或者在底部区域添加用户头像，点击显示下拉菜单

---

#### Task 13: 优化登录后的跳转逻辑

**目标**：用户登录后根据来源页面智能跳转。

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `app/login/page.tsx` | 支持 redirect 参数 |
| `app/auth/callback/page.tsx` | 登录成功后读取 redirect 参数并跳转 |
| `lib/auth-utils.ts`（新建） | 认证相关工具函数 |

**逻辑说明**：
1. 用户在某个页面（如写作页）点击"登录"
2. 跳转到 `/login?redirect=/writing/xiaohongshu`
3. 用户完成登录后，自动跳回原来的页面
4. 如果没有 redirect 参数，默认跳转到首页

---

#### Task 14: 添加积分不足提示和引导

**目标**：当用户积分不足时，给出友好提示并引导充值。

**需要创建/修改的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `components/credits/insufficient-credits-modal.tsx`（新建） | 积分不足弹窗组件 |
| 各个写作模板页面 | 在生成失败时显示弹窗 |

**逻辑说明**：
1. 用户点击"生成"按钮
2. API 返回错误码 `INSUFFICIENT_CREDITS`
3. 前端弹出一个模态框：
   - 标题："积分不足"
   - 内容："当前余额 X 积分，本次生成预计需要 Y 积分"
   - 按钮1："去充值"（跳转充值页）
   - 按钮2："取消"

---

### 阶段五：收尾和测试（Task 15）

---

#### Task 15: 端到端测试和修复

**目标**：完整走一遍用户流程，修复所有问题。

**测试清单**：

| 测试场景 | 预期结果 |
|---------|---------|
| 新用户注册 | 自动获得 10 积分 |
| 查看积分余额 | 顶栏和账户页面都能看到正确余额 |
| 生成文案 | 积分正确扣除，余额实时更新 |
| 积分不足时生成 | 弹出提示，引导充值 |
| 充值套餐 | 支付成功后积分到账 |
| 查看消费记录 | 每笔交易都有记录 |
| 查看我的文档 | 能看到所有历史生成内容 |
| 继续对话修改 | 能在原有基础上修改 |
| 导出文档 | Word/复制都正常工作 |

**需要修复的常见问题**：
- 积分余额缓存导致不实时更新
- 支付回调重复处理导致重复加积分
- 未登录用户访问账户页面的错误处理
- 移动端响应式布局问题

---

## 文件清单汇总

### 新建文件（共 20+ 个）

```
app/
├── account/
│   ├── page.tsx                    # 用户中心主页
│   ├── layout.tsx                  # 用户中心布局
│   ├── transactions/
│   │   └── page.tsx                # 消费记录页
│   ├── recharge/
│   │   └── page.tsx                # 充值页面
│   └── orders/
│       └── page.tsx                # 订单记录页
├── documents/
│   ├── page.tsx                    # 我的文档列表
│   └── [id]/
│       └── page.tsx                # 文档详情页
└── api/
    ├── user/
    │   ├── credits/
    │   │   └── route.ts            # 获取用户积分
    │   └── transactions/
    │       └── route.ts            # 获取消费记录
    └── payment/
        ├── create/
        │   └── route.ts            # 创建支付订单
        └── callback/
            └── route.ts            # 支付回调

components/
├── account/
│   ├── account-sidebar.tsx         # 用户中心侧边栏
│   ├── credits-overview-card.tsx   # 积分概览卡片
│   ├── transactions-table.tsx      # 消费记录表格
│   ├── pricing-card.tsx            # 套餐卡片
│   ├── pricing-grid.tsx            # 套餐网格
│   └── orders-table.tsx            # 订单表格
├── header/
│   └── user-credits-badge.tsx      # 顶栏积分徽章
├── documents/
│   ├── document-card.tsx           # 文档卡片
│   ├── document-list.tsx           # 文档列表
│   ├── document-viewer.tsx         # 文档查看器
│   ├── document-chat.tsx           # 对话修改面板
│   └── export-button.tsx           # 导出按钮
└── credits/
    └── insufficient-credits-modal.tsx  # 积分不足弹窗

hooks/
└── use-credits.ts                  # 获取积分的 Hook

lib/
├── payment.ts                      # 支付工具函数
├── export.ts                       # 导出工具函数
└── auth-utils.ts                   # 认证工具函数

config/
└── pricing.ts                      # 充值套餐配置
```

### 需要修改的文件（共 3 个）

```
components/app-layout.tsx           # 添加顶栏积分显示
components/app-sidebar.tsx          # 添加新导航项
app/login/page.tsx                  # 支持 redirect 参数
```

---

## 开发顺序建议

```
Week 1: Task 1-4（用户中心基础）
   ↓
Week 2: Task 5-8（充值支付）
   ↓
Week 3: Task 9-11（我的文档）
   ↓
Week 4: Task 12-15（优化和测试）
```

---

## 技术要点提醒

1. **所有涉及积分操作的 API 都要做身份验证**
   - 使用 Supabase 的 `getUser()` 获取当前用户
   - 未登录返回 401 错误

2. **支付回调必须做幂等处理**
   - 同一个订单可能收到多次回调
   - 用订单状态判断，已处理的直接返回成功

3. **积分操作要用事务**
   - 扣积分和记录交易要在同一个事务中
   - 防止数据不一致

4. **前端积分显示要及时刷新**
   - 生成完成后重新获取余额
   - 可以用 SWR 或 React Query 管理缓存

---

> 本蓝图由 Claude 4.5 生成，请按 Task 顺序逐步开发。
> 如有疑问，可以带着具体 Task 编号继续提问。
