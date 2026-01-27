import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { UniversalWritingPage } from "@/components/universal-writing-page";

export default function BrandPositioningPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <UniversalWritingPage />
      </Suspense>
    </AppLayout>
  );
}
