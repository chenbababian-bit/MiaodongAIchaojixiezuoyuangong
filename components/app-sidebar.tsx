"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  PenLine,
  FileText,
  Bot,
  Presentation,
  Brain,
  LayoutGrid,
  AppWindow,
  Sun,
  Moon,
  Grid3X3,
} from "lucide-react";

const navItems = [
  { icon: MessageSquare, label: "AI 对话", href: "/chat" },
  { icon: PenLine, label: "AI 写作", href: "/" },
  { icon: FileText, label: "AI 长文", href: "/longtext" },
  { icon: Bot, label: "AI 助理", href: "/assistant" },
  { icon: Presentation, label: "AI PPT", href: "/ppt" },
  { icon: Brain, label: "智能体", href: "/agents" },
  { icon: LayoutGrid, label: "广场", href: "/plaza" },
  { icon: AppWindow, label: "AI 应用", href: "/apps" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[72px] border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b border-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          AI
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col items-center gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors w-[64px]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-2 flex flex-col items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Grid3X3 className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
