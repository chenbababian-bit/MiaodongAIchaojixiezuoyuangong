"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Palette, Bot, Music, Video, Users } from "lucide-react";

const topTabs = [
  { id: "drawing", label: "AI绘画", icon: Palette },
  { id: "assistant", label: "AI助理", icon: Bot },
  { id: "music", label: "AI音乐", icon: Music },
  { id: "video", label: "AI视频", icon: Video },
  { id: "agents", label: "智能体", icon: Users },
];

const categories = [
  { id: "all", label: "全部" },
  { id: "favorite", label: "收藏" },
  { id: "hot", label: "热门" },
  { id: "product", label: "产品设计" },
  { id: "3d", label: "3D艺术" },
  { id: "animal", label: "动物萌宠" },
  { id: "poster", label: "海报设计" },
  { id: "anime", label: "动漫游戏" },
  { id: "scifi", label: "未来科幻" },
  { id: "illustration", label: "绘本插画" },
  { id: "realistic", label: "写实人物" },
];

// 模拟作品数据
const artworks = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
    title: "抽象艺术",
    category: "3D艺术",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    title: "分子结构",
    category: "产品设计",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=300&fit=crop",
    title: "科技感",
    category: "未来科幻",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400&h=300&fit=crop",
    title: "人物肖像",
    category: "写实人物",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=300&fit=crop",
    title: "时尚设计",
    category: "产品设计",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    title: "商务人物",
    category: "写实人物",
  },
];

export function PlazaPage() {
  const [activeTopTab, setActiveTopTab] = useState("drawing");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-300 via-blue-400 to-cyan-300 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
          {/* Diagonal Lines */}
          <div className="absolute top-0 right-1/4 w-px h-full bg-white/20 transform rotate-12" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-white/20 transform rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            海量AI作品等你来发现
          </h1>

          {/* Top Tabs */}
          <div className="flex justify-center gap-3 mb-8">
            {topTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTopTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all",
                  activeTopTab === tab.id
                    ? "bg-white text-primary shadow-lg"
                    : "bg-white/80 text-gray-700 hover:bg-white"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="请输入关键词搜索"
                className="pl-12 h-14 bg-white border-0 shadow-lg text-base rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-sm text-foreground mb-1 truncate">
                  {artwork.title}
                </h3>
                <p className="text-xs text-muted-foreground">{artwork.category}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            加载更多
          </button>
        </div>
      </div>
    </div>
  );
}
