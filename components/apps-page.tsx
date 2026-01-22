"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  Sailboat,
  Globe,
  Presentation,
  Music,
  GitBranch,
  PlayCircle,
  Bot,
  MessageCircle,
  Moon,
} from "lucide-react";

const apps = [
  {
    id: 1,
    icon: Sailboat,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "MJ绘图",
    desc: "更智能的绘画工具",
  },
  {
    id: 2,
    icon: Globe,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "DALLE绘画",
    desc: "一键快速出图",
  },
  {
    id: 3,
    icon: Presentation,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-500",
    title: "AI PPT",
    desc: "一键生成PPT",
  },
  {
    id: 4,
    icon: Music,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    title: "AI音乐",
    desc: "快速生成音乐",
  },
  {
    id: 5,
    icon: GitBranch,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    title: "思维导图",
    desc: "复杂概念快速呈现",
  },
  {
    id: 6,
    icon: PlayCircle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    title: "AI视频",
    desc: "文字+图片，快速生成视频",
  },
  {
    id: 7,
    icon: Bot,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-500",
    title: "AI助理",
    desc: "定制专家级AI助理",
  },
  {
    id: 8,
    icon: MessageCircle,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "智能体",
    desc: "创建AI智能体",
  },
  {
    id: 9,
    icon: Moon,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
    title: "豆包绘图",
    desc: "支持中英文输入绘画",
  },
];

export function AppsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = apps.filter(
    (app) =>
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      {/* Banner */}
      <div className="relative h-[280px] bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Grid Lines */}
          <div className="absolute bottom-0 left-0 right-0 h-24">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-transparent" />
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 h-full w-px bg-white/10"
                style={{ left: `${i * 5}%` }}
              />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 h-px bg-white/10"
                style={{ bottom: `${i * 20}%` }}
              />
            ))}
          </div>
          
          {/* 3D Cube Decoration */}
          <div className="absolute right-[15%] top-1/2 -translate-y-1/2">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/80 to-blue-400/80 rounded-xl transform rotate-12 shadow-lg" />
              <div className="absolute inset-2 bg-gradient-to-br from-blue-300/60 to-cyan-400/60 rounded-lg transform -rotate-6" />
              <div className="absolute inset-4 bg-gradient-to-br from-white/40 to-cyan-200/40 rounded-md" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-white mb-8">应用中心</h1>
          <div className="relative w-full max-w-xl px-4">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="输入您想搜索的应用"
              className="pl-12 h-12 bg-white border-0 shadow-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                  {app.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {app.desc}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                  app.iconBg
                )}
              >
                <app.icon className={cn("h-6 w-6", app.iconColor)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
