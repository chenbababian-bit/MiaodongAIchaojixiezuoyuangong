'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AccountSidebar } from "@/components/account/account-sidebar";

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 未登录用户重定向到登录页
        router.push("/login");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 主布局容器 */}
      <div className="flex">
        {/* 左侧侧边栏 */}
        <div className="hidden lg:block">
          <AccountSidebar className="fixed left-0 top-0 h-screen" />
        </div>

        {/* 移动端侧边栏占位 */}
        <div className="lg:hidden">
          <div className="h-16" /> {/* 为移动端顶部导航留空间 */}
        </div>

        {/* 主内容区域 */}
        <main className="flex-1 lg:pl-64">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* 移动端底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around p-2">
          <a
            href="/account"
            className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground"
          >
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-medium">概</span>
            </div>
            <span>概览</span>
          </a>
          <a
            href="/account/recharge"
            className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground"
          >
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-medium">充</span>
            </div>
            <span>充值</span>
          </a>
          <a
            href="/account/transactions"
            className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground"
          >
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-medium">记</span>
            </div>
            <span>记录</span>
          </a>
          <a
            href="/documents"
            className="flex flex-col items-center gap-1 p-2 text-xs text-muted-foreground"
          >
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-[10px] font-medium">文</span>
            </div>
            <span>文档</span>
          </a>
        </div>
      </div>
    </div>
  );
}