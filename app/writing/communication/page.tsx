import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { CommunicationWritingPage } from "@/components/communication-writing-page";

export default function CommunicationPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <CommunicationWritingPage />
      </Suspense>
    </AppLayout>
  );
}
