import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { VideoWritingPage } from "@/components/video-writing-page";

export default function VideoWriting() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <VideoWritingPage />
      </Suspense>
    </AppLayout>
  );
}
