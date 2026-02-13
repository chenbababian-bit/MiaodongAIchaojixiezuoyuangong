import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { PersonalDevelopmentWritingPage } from "@/components/personal-development-writing-page";

export default function PersonalDevelopmentPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <PersonalDevelopmentWritingPage />
      </Suspense>
    </AppLayout>
  );
}
