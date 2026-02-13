import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { GovernmentAffairsWritingPage } from "@/components/government-affairs-writing-page";

export default function GovernmentAffairsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div>加载中...</div>}>
        <GovernmentAffairsWritingPage />
      </Suspense>
    </AppLayout>
  );
}
