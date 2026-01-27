import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { GeneralWritingDetailPage } from "@/components/general-writing-detail-page";

export default function GeneralWritingPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <GeneralWritingDetailPage />
      </Suspense>
    </AppLayout>
  );
}
