import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { ReportWritingPage } from "@/components/report-writing-page";

export default function ReportPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <ReportWritingPage />
      </Suspense>
    </AppLayout>
  );
}
