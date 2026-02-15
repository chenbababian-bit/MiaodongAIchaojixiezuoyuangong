import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { MediaWritingPage } from "@/components/media-writing-page";

export default function MediaPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <MediaWritingPage />
      </Suspense>
    </AppLayout>
  );
}
