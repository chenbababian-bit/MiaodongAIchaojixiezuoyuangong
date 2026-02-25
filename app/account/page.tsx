import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, History, FileText, Settings, ArrowUpRight, Download, Loader2 } from "lucide-react";
import { useUserCredits } from "@/hooks/use-user-credits";

export default function AccountPage() {
  const { credits, loading, error, refreshCredits } = useUserCredits();
  
  // 模拟用户基本信息（后续可以从用户API获取）
  const userData = {
    name: "张三",
    email: "zhangsan@example.com",
    joinDate: "2024-01-15",
  };

  const quickActions = [
    { icon: CreditCard, label: "立即充值", description: "购买积分继续使用", href: "/account/recharge", color: "bg-blue-500" },
    { icon: History, label: "查看记录", description: "消费明细一目了然", href: "/account/transactions", color: "bg-green-500" },
    { icon: FileText, label: "我的文档", description: "管理生成的内容", href: "/documents", color: "bg-purple-500" },
    { icon: Settings, label: "账户设置", description: "修改个人信息", href: "/account/settings", color: "bg-gray-500" },
  ];

  const recentTransactions = [
    { id: 1, type: "消费", description: "小红书爆款文案生成", amount: -5, date: "2024-02-24 10:30", balance: 125 },
    { id: 2, type: "消费", description: "微信公众号文章", amount: -10, date: "2024-02-23 15:20", balance: 130 },
    { id: 3, type: "充值", description: "微信支付充值", amount: +100, date: "2024-02-22 09:15", balance: 140 },
    { id: 4, type: "消费", description: "抖音短视频脚本", amount: -8, date: "2024-02-21 14:45", balance: 40 },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">账户概览</h1>
        <p className="text-muted-foreground">
          欢迎回来，{userData.name}！这里是您的账户管理中心
        </p>
      </div>

      {/* 积分概览卡片 */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            积分余额
          </CardTitle>
          <CardDescription>您的当前积分和消费情况</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">加载积分数据中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={refreshCredits} variant="outline">
                重试
              </Button>
            </div>
          ) : credits ? (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-5xl font-bold">{credits.balance.toLocaleString()}</div>
                  <p className="text-muted-foreground">当前可用积分</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-semibold text-green-600">+{credits.total_earned.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">累计获得</p>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-red-600">-{credits.total_consumed.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">累计消费</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button size="lg" className="w-full lg:w-auto" asChild>
                  <a href="/account/recharge">
                    <CreditCard className="mr-2 h-4 w-4" />
                    立即充值
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="w-full lg:w-auto" asChild>
                  <a href="/account/transactions">
                    <History className="mr-2 h-4 w-4" />
                    查看明细
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无积分数据</p>
              <Button onClick={refreshCredits} variant="outline" className="mt-4">
                刷新
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`${action.color} p-3 rounded-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mt-4">{action.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <a href={action.href}>立即前往</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 最近交易记录 */}
      <Card>
        <CardHeader>
          <CardTitle>最近交易记录</CardTitle>
          <CardDescription>您最近的积分变动情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {transaction.amount > 0 ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.date} • {transaction.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount} 积分
                  </div>
                  <div className="text-sm text-muted-foreground">
                    余额: {transaction.balance}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline" asChild>
              <a href="/account/transactions">查看全部记录</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 账户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>账户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">姓名</label>
                <div className="text-lg">{userData.name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                <div className="text-lg">{userData.email}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                <div className="text-lg">{userData.joinDate}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">账户状态</label>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-lg">正常</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}