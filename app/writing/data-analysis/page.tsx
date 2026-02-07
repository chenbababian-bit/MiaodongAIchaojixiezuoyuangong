"use client";

import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { DataAnalysisWritingPage } from "@/components/data-analysis-writing-page";

export default function DataAnalysisPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <DataAnalysisWritingPage />
      </Suspense>
    </AppLayout>
  );
}
