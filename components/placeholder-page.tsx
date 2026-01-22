"use client";

import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Construction className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {description || "该功能正在开发中，敬请期待..."}
        </p>
      </div>
    </div>
  );
}
