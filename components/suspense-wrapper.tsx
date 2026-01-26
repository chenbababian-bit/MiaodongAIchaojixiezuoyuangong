"use client";

import { Suspense, ReactNode } from "react";

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Suspense 包装组件
 * 用于包裹使用 useSearchParams 等需要 Suspense 边界的组件
 */
export function SuspenseWrapper({
  children,
  fallback = <div className="flex items-center justify-center h-screen">加载中...</div>
}: SuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
