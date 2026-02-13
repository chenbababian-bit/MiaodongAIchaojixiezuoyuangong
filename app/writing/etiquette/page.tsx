import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { EtiquetteWritingPage } from "@/components/etiquette-writing-page";

export default function EtiquettePage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <EtiquetteWritingPage />
      </Suspense>
    </AppLayout>
  );
}
