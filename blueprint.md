# 妙懂 AI 写作平台 - 项目开发蓝图 v2.0

> 最后更新：2026-02-24
> 项目定位：面向职场人士和企业的"全职业办公写作生产力工具"
>
> **重要原则：每个 Task 完成后必须能立即在界面上看到效果并验证！**

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

> ⚠️ **执行须知**：
> 1. 每个 Task 都包含"验证步骤"，完成后必须验证通过才算完成
> 2. 每个 Task 都会在界面上产生可见的变化
> 3. 按顺序执行，不要跳过任何 Task

---

### Task 1: 创建用户中心页面 + 添加入口按钮

**目标**：创建用户中心基础页面，并在侧边栏添加入口，让用户能点击进入。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/page.tsx` | 用户中心主页面，暂时显示"欢迎来到用户中心"和用户基本信息 |
| `app/account/layout.tsx` | 用户中心布局，包含左侧导航（账户概览、消费记录、充值中心） |
| `components/account/account-sidebar.tsx` | 用户中心内部的左侧导航组件 |

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `components/app-sidebar.tsx` | 在 `navItems` 数组末尾添加"账户"导航项 |

**具体修改内容（app-sidebar.tsx）**：
1. 在文件顶部导入 `User` 图标：`import { ..., User } from "lucide-react"`
2. 在 `navItems` 数组中添加新项：
   ```
   { icon: User, label: "账户", href: "/account" }
   ```

**页面逻辑说明**：
1. 用户点击左侧主导航栏底部的"账户"按钮
2. 跳转到 `/account` 页面
3. 页面检查用户是否已登录，未登录则跳转到 `/login`
4. 已登录用户看到用户中心页面，左侧是子导航，右侧是内容区
5. 默认显示"账户概览"，内容暂时只显示用户邮箱和欢迎语

**验证步骤**：
1. 启动项目 `npm run dev`
2. 打开浏览器访问首页
3. ✅ 确认左侧导航栏底部出现"账户"按钮（User 图标）
4. 点击"账户"按钮
5. ✅ 如果未登录，应跳转到登录页
6. ✅ 如果已登录，应看到用户中心页面，左侧有"账户概览"、"消费记录"、"充值中心"三个菜单

---

### Task 2: 显示用户积分余额（用户中心内）

**目标**：在用户中心首页显示用户当前积分余额、累计获得、累计消费。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/api/user/credits/route.ts` | 获取当前用户积分的 API 接口 |
| `components/account/credits-overview-card.tsx` | 积分概览卡片组件 |
| `hooks/use-credits.ts` | 获取积分的自定义 Hook |

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `app/account/page.tsx` | 引入并使用 `credits-overview-card` 组件 |

**API 接口逻辑（/api/user/credits）**：
1. 从请求中获取当前登录用户（通过 Supabase Auth）
2. 调用已有的 `lib/credits.ts` 中的 `getUserCredits(userId)` 函数
3. 返回 JSON：`{ balance, total_earned, total_consumed }`
4. 未登录返回 401 错误

**卡片组件设计**：
1. 大卡片样式，背景可以用渐变色
2. 中间大号数字显示当前余额（如 "125 积分"）
3. 下方两个小字显示"累计获得 xxx" 和 "累计消费 xxx"
4. 右侧或底部放一个"去充值"按钮（暂时点击无反应，后续 Task 实现）

**use-credits Hook 逻辑**：
1. 使用 `useState` 存储积分数据
2. 使用 `useEffect` 在组件挂载时调用 `/api/user/credits`
3. 提供 `loading` 状态和 `refetch` 函数
4. 导出 `{ credits, loading, error, refetch }`

**验证步骤**：
1. 登录账号
2. 进入用户中心页面（点击侧边栏"账户"）
3. ✅ 确认页面显示积分概览卡片
4. ✅ 确认卡片显示当前余额（应该是 10 积分，新用户默认值）
5. ✅ 确认显示累计获得和累计消费
6. 去生成一篇文案（消耗积分）
7. 返回用户中心，刷新页面
8. ✅ 确认积分余额已减少

---

### Task 3: 在全局顶栏显示积分余额

**目标**：让用户在任何页面都能看到积分余额，不用进入用户中心。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `components/header/user-credits-badge.tsx` | 顶栏积分徽章组件 |

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `components/app-layout.tsx` | 在顶部导航栏右侧添加积分徽章组件 |

**徽章组件设计**：
1. 小巧的横向布局：`💰 125 积分` 或 `Coins图标 + 数字`
2. 使用 Task 2 创建的 `use-credits` Hook 获取数据
3. 加载中显示 skeleton 骨架屏
4. 积分不足（< 5）时用红色/橙色警告
5. 点击跳转到充值页面（`/account/recharge`，暂时 404 没关系）
6. 未登录用户不显示此组件

**修改 app-layout.tsx**：
1. 导入 `UserCreditsBadge` 组件
2. 在顶栏右侧（搜索框旁边或用户头像旁边）添加该组件
3. 需要判断用户登录状态，未登录不渲染

**验证步骤**：
1. 登录账号
2. 访问首页（写作模板页面）
3. ✅ 确认顶栏右侧显示积分徽章（如 "💰 10 积分"）
4. 点击任意写作模板，进入写作页面
5. ✅ 确认顶栏积分徽章仍然显示（全局可见）
6. 生成一篇文案
7. ✅ 确认顶栏积分数字减少（实时更新）
8. 退出登录
9. ✅ 确认顶栏不再显示积分徽章

---

### Task 4: 创建消费记录页面

**目标**：让用户查看所有积分消费明细。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/transactions/page.tsx` | 消费记录页面 |
| `app/api/user/transactions/route.ts` | 获取消费记录的 API |
| `components/account/transactions-table.tsx` | 消费记录表格组件 |

**API 接口逻辑（/api/user/transactions）**：
1. 获取当前登录用户
2. 调用 `lib/credits.ts` 中的 `getTransactionHistory(userId, { limit: 50 })`
3. 返回交易记录数组
4. 支持分页参数：`?page=1&limit=20`

**表格组件设计**：
1. 列：时间、类型、描述、积分变动、操作后余额
2. 类型用不同颜色标签：消费(红)、充值(绿)、赠送(蓝)
3. 积分变动：消费显示 "-5"（红色），充值显示 "+100"（绿色）
4. 底部"加载更多"按钮（如果有更多数据）
5. 空状态显示"暂无消费记录"

**页面逻辑**：
1. 用户点击用户中心左侧的"消费记录"菜单
2. 跳转到 `/account/transactions`
3. 页面加载时调用 API 获取数据
4. 用表格展示所有记录

**验证步骤**：
1. 登录账号
2. 先去生成几篇文案（产生消费记录）
3. 进入用户中心，点击左侧"消费记录"
4. ✅ 确认跳转到消费记录页面
5. ✅ 确认表格显示刚才的消费记录
6. ✅ 确认每条记录显示：时间、类型、描述、积分变动
7. ✅ 确认新用户注册的赠送记录也显示（类型为"赠送"）

---

### Task 5: 创建充值套餐配置和页面 UI

**目标**：创建充值页面，展示所有充值套餐供用户选择。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `config/pricing.ts` | 充值套餐配置 |
| `app/account/recharge/page.tsx` | 充值页面 |
| `components/account/pricing-card.tsx` | 单个套餐卡片 |
| `components/account/pricing-grid.tsx` | 套餐网格布局 |

**套餐配置内容（pricing.ts）**：
```typescript
export const pricingPackages = [
  { id: 'trial', name: '体验包', price: 1, credits: 10, bonus: 0, popular: false },
  { id: 'starter', name: '入门包', price: 10, credits: 100, bonus: 0, popular: false },
  { id: 'standard', name: '标准包', price: 50, credits: 500, bonus: 50, popular: true },
  { id: 'pro', name: '专业包', price: 100, credits: 1000, bonus: 200, popular: false },
  { id: 'enterprise', name: '企业包', price: 500, credits: 5000, bonus: 1500, popular: false },
];
```

**页面设计**：
1. 顶部显示当前积分余额（复用 Task 2 的组件或 Hook）
2. 中间是套餐卡片网格（2-3 列）
3. 每个卡片显示：套餐名、价格、获得积分、赠送积分（如有）
4. 推荐套餐（popular: true）加"最划算"标签，边框高亮
5. 点击卡片选中（高亮边框）
6. 底部显示支付方式选择（微信/支付宝图标）
7. "立即支付"按钮（暂时点击弹出 toast "支付功能开发中"）

**验证步骤**：
1. 登录账号
2. 进入用户中心，点击左侧"充值中心"
3. ✅ 确认跳转到充值页面
4. ✅ 确认顶部显示当前积分余额
5. ✅ 确认显示 5 个充值套餐卡片
6. ✅ 确认"标准包"有"最划算"标签
7. 点击某个套餐
8. ✅ 确认该卡片高亮选中
9. 点击"立即支付"按钮
10. ✅ 确认弹出提示"支付功能开发中"

---

### Task 6: 对接支付接口（创建订单）

**目标**：用户选择套餐后，能够创建支付订单并跳转到支付。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `lib/payment.ts` | 支付工具函数（订单号生成、签名等） |
| `app/api/payment/create/route.ts` | 创建支付订单 API |

**需要在 Supabase 创建数据表**：
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_no VARCHAR(32) UNIQUE NOT NULL,
  package_id VARCHAR(20) NOT NULL,
  package_name VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,          -- 金额，单位：分
  credits INTEGER NOT NULL,         -- 获得积分
  bonus INTEGER DEFAULT 0,          -- 赠送积分
  status VARCHAR(20) DEFAULT 'pending',  -- pending/paid/failed/refunded
  payment_method VARCHAR(20),       -- wechat/alipay
  payment_url TEXT,                 -- 支付链接
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**创建订单 API 逻辑（/api/payment/create）**：
1. 接收参数：`{ packageId, paymentMethod }`
2. 验证用户已登录
3. 根据 packageId 从配置获取套餐信息
4. 生成唯一订单号（如 `MD20260224120000001`）
5. 在数据库创建订单记录（status: pending）
6. 调用第三方支付平台 API 创建预支付订单（如虎皮椒、PayJS）
7. 返回 `{ orderNo, paymentUrl }` 给前端
8. 前端跳转到 paymentUrl 进行支付

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `app/account/recharge/page.tsx` | "立即支付"按钮调用创建订单 API，跳转支付 |

**环境变量配置（.env.local）**：
```
PAYMENT_API_URL=xxx        # 支付平台 API 地址
PAYMENT_APP_ID=xxx         # 支付平台 App ID
PAYMENT_APP_SECRET=xxx     # 支付平台密钥
PAYMENT_NOTIFY_URL=xxx     # 支付回调地址
```

**验证步骤**：
1. 登录账号
2. 进入充值页面
3. 选择一个套餐，点击"立即支付"
4. ✅ 确认跳转到支付页面（或弹出支付二维码）
5. 检查数据库 orders 表
6. ✅ 确认创建了一条 pending 状态的订单
7. （暂不实际支付，等 Task 7 完成回调后再测试）

---

### Task 7: 支付回调处理

**目标**：用户支付成功后，自动给用户加积分。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/api/payment/callback/route.ts` | 支付成功回调 API |
| `app/account/recharge/success/page.tsx` | 支付成功页面 |

**回调 API 逻辑（/api/payment/callback）**：
1. 接收支付平台的回调通知（POST 请求）
2. 验证签名（防止伪造请求）
3. 根据订单号查询数据库中的订单
4. 检查订单状态，如果已处理过则直接返回成功（幂等处理）
5. 验证金额是否匹配
6. 调用 `lib/credits.ts` 的 `rechargeCredits(userId, credits + bonus)` 加积分
7. 更新订单状态为 `paid`，记录 `paid_at` 时间
8. 返回成功响应给支付平台

**支付成功页面设计**：
1. 大大的绿色勾号图标
2. "支付成功！"标题
3. 显示：充值金额、获得积分、当前余额
4. "返回用户中心"按钮

**重要：幂等处理逻辑**：
```
如果 order.status === 'paid':
    直接返回成功，不要重复加积分！
```

**验证步骤**：
1. 使用支付平台的测试/沙箱模式
2. 完成一笔测试支付
3. ✅ 确认回调被正确调用（可以加日志）
4. ✅ 确认订单状态变为 paid
5. ✅ 确认用户积分增加
6. ✅ 确认消费记录中有一条"充值"记录
7. 再次触发相同的回调
8. ✅ 确认积分没有重复增加（幂等测试）

---

### Task 8: 创建订单记录页面

**目标**：让用户查看自己的充值订单历史。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/account/orders/page.tsx` | 订单记录页面 |
| `app/api/user/orders/route.ts` | 获取用户订单 API |
| `components/account/orders-table.tsx` | 订单表格组件 |

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `components/account/account-sidebar.tsx` | 添加"订单记录"菜单项 |

**API 接口逻辑（/api/user/orders）**：
1. 获取当前登录用户
2. 查询 orders 表，按创建时间倒序
3. 返回订单列表

**表格设计**：
1. 列：订单号、套餐名称、金额、积分、状态、时间
2. 状态用不同颜色：待支付(黄)、已完成(绿)、已取消(灰)
3. 待支付的订单显示"继续支付"按钮

**验证步骤**：
1. 登录账号（使用之前测试支付的账号）
2. 进入用户中心
3. ✅ 确认左侧导航出现"订单记录"菜单
4. 点击进入订单记录页面
5. ✅ 确认显示之前的充值订单
6. ✅ 确认订单状态显示正确

---

### Task 9: 创建"我的文档"列表页面

**目标**：让用户查看自己生成过的所有文档。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/documents/page.tsx` | 我的文档列表页面 |
| `app/api/user/documents/route.ts` | 获取用户文档列表 API |
| `components/documents/document-card.tsx` | 文档卡片组件 |
| `components/documents/document-list.tsx` | 文档列表组件 |

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `components/app-sidebar.tsx` | 在 `navItems` 中添加"我的文档"导航项（在"账户"之前） |

**具体修改内容（app-sidebar.tsx）**：
1. 导入 `FileText` 图标
2. 在 `navItems` 数组中添加：
   ```
   { icon: FileText, label: "我的文档", href: "/documents" }
   ```

**API 接口逻辑（/api/user/documents）**：
1. 获取当前登录用户
2. 调用 `lib/conversations.ts` 的 `getConversations(userId)`
3. 返回文档列表，每个包含：id、title、type、created_at、updated_at

**卡片组件设计**：
1. 显示文档标题（或内容前 30 字）
2. 显示模板类型标签（如"小红书爆款文案"）
3. 显示创建时间
4. 悬浮显示操作按钮：查看、删除
5. 点击卡片跳转到详情页

**页面设计**：
1. 顶部显示"我的文档"标题 + 文档数量
2. 可选：搜索框、筛选（按模板类型）
3. 卡片网格布局（3-4 列）
4. 空状态显示"还没有生成过文档，去创作一个吧"+ 按钮

**验证步骤**：
1. 登录账号
2. 先去生成几篇不同类型的文案
3. 点击侧边栏"我的文档"
4. ✅ 确认跳转到我的文档页面
5. ✅ 确认显示刚才生成的文档
6. ✅ 确认每个文档卡片显示标题、类型、时间
7. ✅ 确认点击卡片能跳转（暂时 404，下个 Task 实现）

---

### Task 10: 创建文档详情页面

**目标**：让用户查看某个文档的完整内容，并可以继续对话修改。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `app/documents/[id]/page.tsx` | 文档详情页面（动态路由） |
| `components/documents/document-viewer.tsx` | 文档内容查看器 |
| `components/documents/document-chat.tsx` | 对话修改面板 |

**页面布局**：
1. 左侧（60%宽度）：文档内容展示
   - 顶部显示标题、创建时间
   - 中间是文档正文（支持滚动）
   - 底部是操作按钮（复制、导出、删除）
2. 右侧（40%宽度）：对话历史 + 输入框
   - 显示之前的对话消息
   - 底部输入框，可以继续对话
   - 发送后 AI 返回修改建议或新版本

**数据获取**：
1. 从 URL 获取文档 ID
2. 调用 `getConversationWithMessages(id)` 获取文档和消息
3. 展示内容

**对话功能**：
1. 用户输入"帮我改得更正式一点"
2. 前端发送请求到对应的 API（根据文档类型）
3. 带上历史对话作为上下文
4. AI 返回修改后的内容
5. 保存新消息到数据库
6. 更新左侧文档内容

**验证步骤**：
1. 登录账号
2. 进入"我的文档"，点击某个文档
3. ✅ 确认跳转到详情页
4. ✅ 确认左侧显示文档内容
5. ✅ 确认右侧显示对话历史
6. 在右侧输入框输入"帮我改短一点"
7. ✅ 确认 AI 返回修改后的内容
8. ✅ 确认左侧内容更新

---

### Task 11: 添加文档导出功能

**目标**：让用户能够复制文档内容或导出为 Word 文件。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `lib/export.ts` | 导出工具函数 |
| `components/documents/export-button.tsx` | 导出按钮组件（下拉菜单） |

**需要安装的依赖**：
```bash
npm install docx file-saver
npm install -D @types/file-saver
```

**导出按钮设计**：
1. 点击显示下拉菜单
2. 选项：复制到剪贴板、导出为 Word、导出为纯文本

**导出工具函数（lib/export.ts）**：
1. `copyToClipboard(text)` - 复制到剪贴板
2. `exportToWord(title, content)` - 导出为 .docx 文件
3. `exportToText(title, content)` - 导出为 .txt 文件

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `app/documents/[id]/page.tsx` | 在文档查看器底部添加导出按钮 |

**验证步骤**：
1. 进入某个文档详情页
2. 点击"复制"按钮
3. ✅ 确认弹出 toast "已复制到剪贴板"
4. 粘贴到记事本
5. ✅ 确认内容正确
6. 点击"导出 Word"
7. ✅ 确认下载了一个 .docx 文件
8. 用 Word 打开
9. ✅ 确认内容正确

---

### Task 12: 添加积分不足提示弹窗

**目标**：当用户积分不足时，给出友好提示并引导充值。

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `components/credits/insufficient-credits-modal.tsx` | 积分不足弹窗组件 |

**弹窗设计**：
1. 标题：积分不足
2. 内容：当前余额 X 积分，本次生成预计需要 Y 积分
3. 按钮1：去充值（跳转 /account/recharge）
4. 按钮2：取消（关闭弹窗）

**需要修改的地方**：
在各个写作模板页面中，当 API 返回 `INSUFFICIENT_CREDITS` 错误时，显示此弹窗。

由于写作模板页面很多，建议：
1. 创建一个全局的弹窗组件
2. 使用 React Context 或 Zustand 管理弹窗状态
3. 在 `app-layout.tsx` 中渲染弹窗
4. 各页面调用 `showInsufficientCreditsModal()` 即可

**验证步骤**：
1. 登录一个积分很少（< 1）的账号
2. 去生成一篇文案
3. ✅ 确认弹出积分不足弹窗
4. ✅ 确认显示当前余额和所需积分
5. 点击"去充值"
6. ✅ 确认跳转到充值页面
7. 充值后返回，再次生成
8. ✅ 确认正常生成（不再弹窗）

---

### Task 13: 优化登录跳转逻辑

**目标**：用户登录后能返回原来的页面，而不是总是跳转到首页。

**需要修改的文件**：

| 文件路径 | 修改说明 |
|---------|---------|
| `app/login/page.tsx` | 支持读取 `redirect` URL 参数 |
| `app/auth/callback/page.tsx` | 登录成功后读取 redirect 参数并跳转 |
| `middleware.ts` | 未登录时重定向到 login 页面时，带上 redirect 参数 |

**逻辑说明**：
1. 用户在 `/documents` 页面（需要登录）
2. 未登录被重定向到 `/login?redirect=/documents`
3. 用户完成登录
4. 登录成功后跳转到 `/documents`（而不是首页）

**需要创建的文件**：

| 文件路径 | 用途说明 |
|---------|---------|
| `lib/auth-utils.ts` | 认证相关工具函数 |

**验证步骤**：
1. 退出登录
2. 直接访问 `/account`
3. ✅ 确认跳转到 `/login?redirect=/account`
4. 完成登录
5. ✅ 确认跳转回 `/account`（不是首页）
6. 退出登录
7. 直接访问 `/documents`
8. 登录后
9. ✅ 确认跳转回 `/documents`

---

### Task 14: 最终测试和修复

**目标**：完整走一遍所有用户流程，确保没有遗漏和 bug。

**测试清单**：

| 序号 | 测试场景 | 预期结果 | 通过 |
|------|---------|---------|------|
| 1 | 新用户注册 | 自动获得 10 积分 | ⬜ |
| 2 | 查看顶栏积分 | 显示正确余额 | ⬜ |
| 3 | 进入用户中心 | 能通过侧边栏进入 | ⬜ |
| 4 | 查看积分详情 | 显示余额、累计获得、累计消费 | ⬜ |
| 5 | 生成文案 | 积分正确扣除 | ⬜ |
| 6 | 顶栏积分更新 | 生成后实时减少 | ⬜ |
| 7 | 查看消费记录 | 每笔消费都有记录 | ⬜ |
| 8 | 积分不足生成 | 弹出提示，引导充值 | ⬜ |
| 9 | 选择充值套餐 | 套餐信息正确显示 | ⬜ |
| 10 | 发起支付 | 能跳转到支付页面 | ⬜ |
| 11 | 支付成功 | 积分到账，订单状态更新 | ⬜ |
| 12 | 查看订单记录 | 显示所有充值订单 | ⬜ |
| 13 | 查看我的文档 | 显示所有生成的文档 | ⬜ |
| 14 | 查看文档详情 | 内容正确，可继续对话 | ⬜ |
| 15 | 导出文档 | 复制/Word 导出正常 | ⬜ |
| 16 | 登录跳转 | 登录后返回原页面 | ⬜ |
| 17 | 移动端适配 | 各页面响应式正常 | ⬜ |

**常见问题修复清单**：
- [ ] 积分余额缓存导致不实时更新 → 使用 SWR 或手动 refetch
- [ ] 支付回调重复处理 → 检查幂等逻辑
- [ ] 未登录访问报错 → 检查 middleware 配置
- [ ] 移动端布局错乱 → 检查响应式断点

---

## 文件清单汇总

### 新建文件（共 25 个）

```
app/
├── account/
│   ├── page.tsx                    # Task 1: 用户中心主页
│   ├── layout.tsx                  # Task 1: 用户中心布局
│   ├── transactions/
│   │   └── page.tsx                # Task 4: 消费记录页
│   ├── recharge/
│   │   ├── page.tsx                # Task 5: 充值页面
│   │   └── success/
│   │       └── page.tsx            # Task 7: 支付成功页
│   └── orders/
│       └── page.tsx                # Task 8: 订单记录页
├── documents/
│   ├── page.tsx                    # Task 9: 我的文档列表
│   └── [id]/
│       └── page.tsx                # Task 10: 文档详情页
└── api/
    ├── user/
    │   ├── credits/
    │   │   └── route.ts            # Task 2: 获取用户积分
    │   ├── transactions/
    │   │   └── route.ts            # Task 4: 获取消费记录
    │   ├── orders/
    │   │   └── route.ts            # Task 8: 获取订单记录
    │   └── documents/
    │       └── route.ts            # Task 9: 获取用户文档
    └── payment/
        ├── create/
        │   └── route.ts            # Task 6: 创建支付订单
        └── callback/
            └── route.ts            # Task 7: 支付回调

components/
├── account/
│   ├── account-sidebar.tsx         # Task 1: 用户中心侧边栏
│   ├── credits-overview-card.tsx   # Task 2: 积分概览卡片
│   ├── transactions-table.tsx      # Task 4: 消费记录表格
│   ├── pricing-card.tsx            # Task 5: 套餐卡片
│   ├── pricing-grid.tsx            # Task 5: 套餐网格
│   └── orders-table.tsx            # Task 8: 订单表格
├── header/
│   └── user-credits-badge.tsx      # Task 3: 顶栏积分徽章
├── documents/
│   ├── document-card.tsx           # Task 9: 文档卡片
│   ├── document-list.tsx           # Task 9: 文档列表
│   ├── document-viewer.tsx         # Task 10: 文档查看器
│   ├── document-chat.tsx           # Task 10: 对话修改面板
│   └── export-button.tsx           # Task 11: 导出按钮
└── credits/
    └── insufficient-credits-modal.tsx  # Task 12: 积分不足弹窗

hooks/
└── use-credits.ts                  # Task 2: 获取积分 Hook

lib/
├── payment.ts                      # Task 6: 支付工具函数
├── export.ts                       # Task 11: 导出工具函数
└── auth-utils.ts                   # Task 13: 认证工具函数

config/
└── pricing.ts                      # Task 5: 充值套餐配置
```

### 需要修改的文件

| 文件 | 修改的 Task |
|------|------------|
| `components/app-sidebar.tsx` | Task 1（加账户入口）、Task 9（加文档入口） |
| `components/app-layout.tsx` | Task 3（加顶栏积分） |
| `app/account/page.tsx` | Task 2（加积分卡片） |
| `components/account/account-sidebar.tsx` | Task 8（加订单菜单） |
| `app/documents/[id]/page.tsx` | Task 11（加导出按钮） |
| `app/login/page.tsx` | Task 13（支持 redirect） |
| `app/auth/callback/page.tsx` | Task 13（登录后跳转） |
| `middleware.ts` | Task 13（重定向带参数） |

---

## 开发顺序和时间预估

| 阶段 | Task | 预计时间 | 里程碑 |
|------|------|---------|--------|
| Week 1 | Task 1-4 | 3-4天 | 用户中心基础可用 |
| Week 2 | Task 5-8 | 4-5天 | 充值支付系统完成 |
| Week 3 | Task 9-11 | 3-4天 | 文档管理系统完成 |
| Week 4 | Task 12-14 | 2-3天 | 体验优化 + 测试修复 |

---

## 执行提示

1. **严格按顺序执行**：Task 之间有依赖关系，不要跳过
2. **每个 Task 完成后必须验证**：按照验证步骤逐项检查
3. **遇到问题及时记录**：可以在对应 Task 下面添加备注
4. **代码提交粒度**：每完成一个 Task 提交一次 Git

---

> 本蓝图 v2.0 由 Claude 4.5 生成
> 核心改进：每个 Task 都是独立可验证的，不会出现"做完看不到效果"的情况
