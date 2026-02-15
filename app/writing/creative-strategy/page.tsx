import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { CreativeStrategyWritingPage } from "@/components/creative-strategy-writing-page";

export default function CreativeStrategyPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <CreativeStrategyWritingPage />
      </Suspense>
    </AppLayout>
  );
}
