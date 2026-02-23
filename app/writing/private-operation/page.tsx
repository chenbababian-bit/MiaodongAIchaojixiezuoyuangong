import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { PrivateOperationWritingPage } from "@/components/private-operation-writing-page";

export default function PrivateOperationPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <PrivateOperationWritingPage />
      </Suspense>
    </AppLayout>
  );
}
