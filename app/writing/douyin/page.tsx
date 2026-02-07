"use client";

import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { DouyinWritingPage } from "@/components/douyin-writing-page";

export default function DouyinPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <DouyinWritingPage />
      </Suspense>
    </AppLayout>
  );
}
