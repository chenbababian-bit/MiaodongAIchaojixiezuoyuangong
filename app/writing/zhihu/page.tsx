"use client";

import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { ZhihuWritingPage } from "@/components/zhihu-writing-page";

export default function ZhihuPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <ZhihuWritingPage />
      </Suspense>
    </AppLayout>
  );
}
