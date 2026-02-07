import { Suspense } from "react";
import DouyinWritingPage from "@/components/douyin-writing-page";

export default function DouyinPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <DouyinWritingPage />
    </Suspense>
  );
}
