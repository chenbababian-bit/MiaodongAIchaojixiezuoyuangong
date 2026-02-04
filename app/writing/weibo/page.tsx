"use client";

import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { WeiboWritingPage } from "@/components/weibo-writing-page";

export default function WeiboPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <WeiboWritingPage />
      </Suspense>
    </AppLayout>
  );
}
