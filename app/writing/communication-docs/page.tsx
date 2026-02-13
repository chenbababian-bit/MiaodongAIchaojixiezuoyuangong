import { Suspense } from "react";
import { CommunicationDocsWritingPage } from "@/components/communication-docs-writing-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <CommunicationDocsWritingPage />
    </Suspense>
  );
}
