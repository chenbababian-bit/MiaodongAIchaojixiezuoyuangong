import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { TeamManagementWritingPage } from "@/components/team-management-writing-page";

export default function TeamManagementPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <TeamManagementWritingPage />
      </Suspense>
    </AppLayout>
  );
}
