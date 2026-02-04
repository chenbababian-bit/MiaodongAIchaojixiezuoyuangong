import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { WechatWritingPage } from "@/components/wechat-writing-page";

export default function WechatPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <WechatWritingPage />
      </Suspense>
    </AppLayout>
  );
}
