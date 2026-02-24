import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { MarketAnalysisWritingPage } from "@/components/market-analysis-writing-page";

export default function MarketAnalysisPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <MarketAnalysisWritingPage />
      </Suspense>
    </AppLayout>
  );
}
