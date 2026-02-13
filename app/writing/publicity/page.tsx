import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { PublicityWritingPage } from "@/components/publicity-writing-page";

export default function PublicityPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <PublicityWritingPage />
      </Suspense>
    </AppLayout>
  );
}
