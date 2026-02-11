import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { SpeechesWritingPage } from "@/components/speeches-writing-page";

export default function SpeechesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <SpeechesWritingPage />
      </Suspense>
    </AppLayout>
  );
}
