"use client";

import { Grid3X3, Sun } from "lucide-react";
import { UserInfo } from "@/components/user-info";
import { CreditsDisplay } from "@/components/credits-display";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
          AI
        </div>
        <span className="text-base font-semibold text-foreground">秒懂AI超级员工</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* 积分显示 */}
        <CreditsDisplay />
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <Sun className="h-4 w-4" />
        </button>
        <UserInfo />
      </div>
    </header>
  );
}
