"use client";

import { Suspense } from "react";
import { AppLayout } from "@/components/app-layout";
import { TravelGuidePage } from "@/components/travel-guide-page";

export default function TravelGuide() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
        <TravelGuidePage />
      </Suspense>
    </AppLayout>
  );
}
