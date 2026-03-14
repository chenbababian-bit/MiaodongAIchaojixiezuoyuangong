# Task 4：积分消费记录页面（优化版工单）

> **执行者必读**：在开始编码前，请先阅读 `docs/DeepSeek执行规范.md`，并完成所有强制检查项。

---

## 📋 任务概述

**任务目标**：创建积分消费记录页面，展示用户的积分消耗历史。

**任务边界**：
- ✅ 需要做：创建积分消费记录页面
- ✅ 需要做：在用户下拉菜单中添加入口（如果不存在）
- ❌ 不需要做：修改充值订单记录页面（这是 Task 8 的内容）
- ❌ 不需要做：修改积分余额显示逻辑（这是 Task 2 的内容）

---

## 🎯 精确执行步骤

### 步骤 1：探索现有代码结构（必须执行）

在开始编码前，执行以下命令并记录结果：

```bash
# 1.1 检查是否已存在积分消费记录页面
ls -la app/account/transactions/page.tsx
ls -la app/account/credits/page.tsx
ls -la app/account/history/page.tsx

# 1.2 检查用户下拉菜单组件
cat components/user-info.tsx

# 1.3 检查账户布局文件
cat app/account/layout.tsx

# 1.4 检查是否有账户侧边栏组件
ls -la components/account/
cat components/account/account-sidebar.tsx 2>/dev/null || echo "侧边栏不存在"
```

**探索结果记录**：
- [ ] 积分消费记录页面是否已存在？ ✅ 存在 / ❌ 不存在
- [ ] 用户下拉菜单中是否已有"积分消费记录"入口？ ✅ 有 / ❌ 没有
- [ ] 账户页面是否有侧边栏？ ✅ 有 / ❌ 没有

---

### 步骤 2：创建积分消费记录页面

**文件路径**：`app/account/transactions/page.tsx`

**为什么选择这个路径**：
- 项目中已存在 `/account` 作为账户中心
- `transactions` 是标准的"交易记录"命名
- 与充值订单记录 `/account/orders` 保持命名一致性

**页面组件结构**：

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, History, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// 交易记录类型定义
interface Transaction {
  id: string
  created_at: string
  feature_name: string
  credits_consumed: number
  balance_after: number
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchTransactions()
  }, [currentPage])

  const fetchTransactions = async () => {
    try {
      setLoading(true)

      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('请先登录')
        router.push('/login')
        return
      }

      // 获取交易记录（分页）
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'consume') // 只查询消费记录
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error('获取交易记录失败:', error)
      toast.error('获取交易记录失败')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>

      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          积分消费记录
        </h1>
        <p className="text-muted-foreground mt-2">
          查看您的积分消费明细
        </p>
      </div>

      {/* 交易记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle>消费明细</CardTitle>
          <CardDescription>
            显示您所有的积分消费记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载中...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无消费记录</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>使用功能</TableHead>
                    <TableHead className="text-right">消耗积分</TableHead>
                    <TableHead className="text-right">剩余积分</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>{transaction.feature_name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          -{transaction.credits_consumed} 积分
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.balance_after.toLocaleString()} 积分
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页控制 */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {currentPage} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={transactions.length < itemsPerPage}
                >
                  下一页
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**代码说明**：
- 使用 Supabase 从 `credit_transactions` 表查询数据
- 只查询 `transaction_type = 'consume'` 的记录（消费记录）
- 支持分页，每页 20 条记录
- 包含返回按钮，点击后返回上一页

---

### 步骤 3：检查并更新用户下拉菜单入口

**文件路径**：`components/user-info.tsx`

**执行前检查**：
```bash
# 检查 user-info.tsx 中是否已有"积分消费记录"菜单项
grep -n "积分消费记录" components/user-info.tsx
grep -n "transactions" components/user-info.tsx
```

**如果不存在，添加以下菜单项**：

在 `components/user-info.tsx` 的下拉菜单中，找到以下位置：

```typescript
<DropdownMenuSeparator />
<DropdownMenuItem onClick={() => router.push('/account')}>
  <UserIcon className="mr-2 h-4 w-4" />
  <span>个人资料</span>
</DropdownMenuItem>
```

在其后添加：

```typescript
<DropdownMenuItem onClick={() => router.push('/account/transactions')}>
  <History className="mr-2 h-4 w-4" />
  <span>积分消费记录</span>
</DropdownMenuItem>
```

**⚠️ 关键检查**：
- [ ] 确认 `/account/transactions` 页面已创建
- [ ] 确认 `History` 图标已从 `lucide-react` 导入
- [ ] 不要删除或修改其他菜单项

---

### 步骤 4：验证实现（必须执行）

```bash
# 4.1 编译检查
npm run build

# 4.2 类型检查
npx tsc --noEmit

# 4.3 检查路由是否正确
ls -la app/account/transactions/page.tsx

# 4.4 检查菜单项是否添加
grep -A 3 "积分消费记录" components/user-info.tsx
```

**验收清单**：
- [ ] 编译通过，无错误
- [ ] TypeScript 类型检查通过
- [ ] `/account/transactions` 页面文件存在
- [ ] 用户下拉菜单中有"积分消费记录"入口
- [ ] 点击菜单项能正确跳转到积分消费记录页面（不会出现 404）

---

## 📊 数据库表结构说明

**表名**：`credit_transactions`

**字段说明**：
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户ID（外键） |
| transaction_type | text | 交易类型（'consume' = 消费，'recharge' = 充值） |
| credits_consumed | numeric | 消耗的积分数（消费记录为正数） |
| balance_after | numeric | 交易后的余额 |
| feature_name | text | 使用的功能名称 |
| created_at | timestamp | 创建时间 |

**查询逻辑**：
```sql
SELECT * FROM credit_transactions
WHERE user_id = [当前用户ID]
  AND transaction_type = 'consume'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

---

## 🚨 常见错误预防

### 错误 1：页面路径选择错误
❌ **错误**：创建 `/profile/transactions` 页面
✅ **正确**：创建 `/account/transactions` 页面
**原因**：项目中账户相关页面都在 `/account` 路径下

### 错误 2：菜单入口位置错误
❌ **错误**：在侧边栏中添加入口（项目中没有侧边栏）
✅ **正确**：在顶部用户下拉菜单中添加入口
**原因**：项目使用顶部下拉菜单作为用户中心入口

### 错误 3：未检查页面存在性
❌ **错误**：直接添加菜单项，不检查目标页面是否存在
✅ **正确**：先创建页面，再添加菜单项，并验证链接有效

### 错误 4：修改了不该修改的内容
❌ **错误**：删除或修改"个人资料"、"退出登录"等现有菜单项
✅ **正确**：只添加"积分消费记录"菜单项，不修改其他内容

---

## 📝 执行报告模板

完成任务后，请提交以下格式的报告：

```markdown
## Task 4 执行报告

### 1. 探索结果
- 积分消费记录页面：❌ 不存在（已创建）
- 用户下拉菜单入口：❌ 不存在（已添加）
- 账户侧边栏：❌ 不存在（项目使用顶部下拉菜单）

### 2. 创建的文件
- `app/account/transactions/page.tsx`（积分消费记录页面）

### 3. 修改的文件
- `components/user-info.tsx`
  - 添加了"积分消费记录"菜单项
  - 导入了 `History` 图标

### 4. 验证结果
- [x] 编译通过（npm run build）
- [x] TypeScript 类型检查通过
- [x] 路由链接有效（/account/transactions 页面存在）
- [x] 菜单项点击正常跳转

### 5. 测试结果
- [x] 页面正常显示
- [x] 能正确获取并展示消费记录
- [x] 分页功能正常
- [x] 未登录时正确跳转到登录页

### 6. 发现的问题
无

### 7. 建议优化
- 建议后续添加日期筛选功能
- 建议添加导出功能
```

---

*工单版本：v2.0（优化版） | 创建日期：2026-03-15 | 制定人：CTO*
