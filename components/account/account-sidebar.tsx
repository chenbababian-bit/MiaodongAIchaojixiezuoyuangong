"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  CreditCard,
  History,
  Settings,
  FileText,
  ShoppingCart,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: User, label: "账户概览", href: "/account" },
  { icon: CreditCard, label: "充值中心", href: "/account/recharge" },
  { icon: History, label: "消费记录", href: "/account/transactions" },
  { icon: FileText, label: "我的文档", href: "/documents" },
  { icon: ShoppingCart, label: "订单记录", href: "/account/orders" },
  { icon: Settings, label: "个人设置", href: "/account/settings" },
];

interface AccountSidebarProps {
  className?: string;
}

export function AccountSidebar({ className }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 border-r border-border bg-card", className)}>
      {/* 用户信息区域 */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">用户中心</h3>
            <p className="text-sm text-muted-foreground truncate">
              管理您的账户和积分
            </p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部退出按钮 */}
      <div className="border-t border-border p-4 mt-auto">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}