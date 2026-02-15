import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { BrandStrategyWritingPage } from "@/components/brand-strategy-writing-page";

export default function BrandStrategyPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <BrandStrategyWritingPage />
      </Suspense>
    </AppLayout>
  );
}
