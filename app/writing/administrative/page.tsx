import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { AdministrativeWritingPage } from "@/components/administrative-writing-page";

export default function AdministrativePage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <AdministrativeWritingPage />
      </Suspense>
    </AppLayout>
  );
}
