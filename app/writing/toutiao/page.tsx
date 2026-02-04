"use client";

import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { ToutiaoWritingPage } from "@/components/toutiao-writing-page";

export default function ToutiaoPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <ToutiaoWritingPage />
      </Suspense>
    </AppLayout>
  );
}
