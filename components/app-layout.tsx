"use client";

import React from "react"

import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="pl-[72px]">
        <AppHeader />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}
