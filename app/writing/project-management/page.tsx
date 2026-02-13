import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { ProjectManagementWritingPage } from "@/components/project-management-writing-page";

export default function ProjectManagementPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <ProjectManagementWritingPage />
      </Suspense>
    </AppLayout>
  );
}
