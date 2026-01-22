"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Search,
  Star,
  Users,
  FileText,
  Megaphone,
  TrendingUp,
  Package,
  ShoppingCart,
  Palette,
  UserCheck,
  Code,
  MessageCircle,
  Wallet,
  Store,
  MapPin,
  Building,
  Film,
  Radio,
  Home,
  Truck,
  Factory,
  Cpu,
  GraduationCap,
  Heart,
  Landmark,
  Shield,
  Car,
  Briefcase,
  Receipt,
  ShoppingBag,
  Flame,
  BookOpen,
  Newspaper,
  Video,
  PenTool,
  FileCheck,
  Calendar,
  Target,
  Sparkles,
} from "lucide-react";

// 分类标签
const categories = [
  { id: "home", label: "首页" },
  { id: "media", label: "自媒体" },
  { id: "general", label: "通用写作" },
  { id: "marketing", label: "营销" },
  { id: "operation", label: "运营" },
  { id: "product", label: "产品" },
  { id: "sales", label: "销售" },
  { id: "design", label: "设计" },
  { id: "hr", label: "人力" },
  { id: "tech", label: "技术" },
  { id: "consulting", label: "咨询模型" },
  { id: "finance", label: "财务" },
  { id: "retail", label: "零售" },
  { id: "local", label: "本地生活" },
  { id: "franchise", label: "招商连锁" },
  { id: "film", label: "影视" },
  { id: "broadcast", label: "媒体" },
  { id: "realestate", label: "地产" },
  { id: "logistics", label: "物流" },
  { id: "manufacture", label: "生产" },
  { id: "electronics", label: "电子" },
  { id: "education", label: "教育" },
  { id: "medical", label: "医疗" },
  { id: "investment", label: "投行" },
  { id: "insurance", label: "金融保险" },
  { id: "legal", label: "法务" },
  { id: "transport", label: "运输" },
  { id: "business", label: "工商" },
  { id: "tax", label: "税务" },
  { id: "ecommerce", label: "电商" },
];

// 侧边筛选
const sideFilters = [
  { id: "recommend", label: "推荐", icon: Sparkles },
  { id: "hot", label: "热门写作", icon: Flame },
  { id: "favorite", label: "收藏最多", icon: Star },
  { id: "newest", label: "最新推出", icon: Calendar },
  { id: "featured", label: "平台精选", icon: Target },
];

// 写作模板数据
const templates = [
  {
    id: 1,
    icon: "xiaohongshu",
    iconBg: "bg-red-500",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意力、引发共鸣、促进互动的自媒体文案...",
    users: 5417,
    category: "自媒体/自媒体文案",
    featured: true,
  },
  {
    id: 2,
    icon: "report",
    iconBg: "bg-emerald-500",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有针对性的政务汇报材料，为上级决策提供依据...",
    users: 3470,
    category: "通用写作/政务公文",
    featured: false,
  },
  {
    id: 3,
    icon: "wechat",
    iconBg: "bg-green-500",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章，提升文章的吸引力和传播力...",
    users: 3777,
    category: "自媒体/自媒体文案",
    featured: true,
  },
  {
    id: 4,
    icon: "video",
    iconBg: "bg-amber-500",
    title: "短视频爆款文案",
    desc: "设计出能够迅速吸引观众注意力并激发他们情感共鸣的短视频文案...",
    users: 2239,
    category: "自媒体/短视频文案",
    featured: false,
  },
  {
    id: 5,
    icon: "toutiao",
    iconBg: "bg-red-600",
    title: "头条爆文",
    desc: "帮助用户创作出能够吸引大量读者、提高阅读量和互动率的爆款文章...",
    users: 2232,
    category: "自媒体/自媒体文案",
    featured: false,
  },
  {
    id: 6,
    icon: "title",
    iconBg: "bg-red-500",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众、提高点击率和互动率的标题...",
    users: 1471,
    category: "自媒体/自媒体文案",
    featured: false,
  },
  {
    id: 7,
    icon: "business",
    iconBg: "bg-purple-500",
    title: "商业计划书",
    desc: "为客户撰写一份详细、全面、具有可行性的商业计划书，帮助客户明确商业目标...",
    users: 1316,
    category: "金融保险/风险投资",
    featured: false,
  },
  {
    id: 8,
    icon: "weekly",
    iconBg: "bg-orange-500",
    title: "周/月/季度工作总结",
    desc: "为用户提供详细、实用的《周/月/季度工作总结》撰写指南...",
    users: 1419,
    category: "通用写作/职场办公",
    featured: false,
  },
  {
    id: 9,
    icon: "hook",
    iconBg: "bg-amber-500",
    title: "短视频黄金3秒开头",
    desc: "设计出能够迅速吸引观众并促使他们继续观看的短视频开头...",
    users: 1025,
    category: "自媒体/短视频文案",
    featured: false,
  },
  {
    id: 10,
    icon: "brand",
    iconBg: "bg-pink-500",
    title: "品牌定位报告",
    desc: "撰写一份详细、准确且具有操作性的品牌定位报告，为品牌的发展提供有力的指导...",
    users: 1339,
    category: "营销/品牌",
    featured: false,
  },
];

// 收藏最多模板
const favoriteTemplates = [
  {
    id: 11,
    icon: "xiaohongshu",
    iconBg: "bg-red-500",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意力、引发共鸣、促进互动的自媒体文案...",
    users: 5417,
    category: "自媒体/自媒体文案",
  },
  {
    id: 12,
    icon: "wechat",
    iconBg: "bg-green-500",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章，提升文章的吸引力和传播力...",
    users: 3777,
    category: "自媒体/自媒体文案",
  },
  {
    id: 13,
    icon: "video",
    iconBg: "bg-amber-500",
    title: "短视频爆款文案",
    desc: "设计出能够迅速吸引观众注意力并激发他们情感共鸣的短视频文案...",
    users: 2239,
    category: "自媒体/短视频文案",
  },
  {
    id: 14,
    icon: "speech",
    iconBg: "bg-teal-500",
    title: "致辞稿",
    desc: "撰写一篇符合政务工作要求、主题明确、内容充实、语言得体的致辞稿...",
    users: 1607,
    category: "通用写作/政务公文",
  },
  {
    id: 15,
    icon: "business",
    iconBg: "bg-purple-500",
    title: "商业计划书",
    desc: "为客户撰写一份详细、全面、具有可行性的商业计划书...",
    users: 1316,
    category: "金融保险/风险投资",
  },
];

function getIconComponent(iconType: string) {
  switch (iconType) {
    case "xiaohongshu":
      return <BookOpen className="h-5 w-5 text-white" />;
    case "report":
      return <FileCheck className="h-5 w-5 text-white" />;
    case "wechat":
      return <MessageCircle className="h-5 w-5 text-white" />;
    case "video":
      return <Video className="h-5 w-5 text-white" />;
    case "toutiao":
      return <Newspaper className="h-5 w-5 text-white" />;
    case "title":
      return <PenTool className="h-5 w-5 text-white" />;
    case "business":
      return <Briefcase className="h-5 w-5 text-white" />;
    case "weekly":
      return <Calendar className="h-5 w-5 text-white" />;
    case "hook":
      return <Target className="h-5 w-5 text-white" />;
    case "brand":
      return <Sparkles className="h-5 w-5 text-white" />;
    case "speech":
      return <Megaphone className="h-5 w-5 text-white" />;
    default:
      return <FileText className="h-5 w-5 text-white" />;
  }
}

export function WritingPage() {
  const [activeCategory, setActiveCategory] = useState("home");
  const [activeFilter, setActiveFilter] = useState("recommend");
  const [filterTab, setFilterTab] = useState<"recommend" | "favorite">("recommend");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Filter Sidebar */}
      <div className="w-[140px] border-r border-border bg-card flex flex-col">
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">首页/</p>
          <p className="text-sm font-medium text-foreground">推荐</p>
        </div>
        <nav className="flex-1 px-2">
          {sideFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm transition-colors mb-1",
                activeFilter === filter.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 border-b border-border">
          {/* Title Row */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-baseline gap-3">
              <h1 className="text-xl font-semibold text-foreground">AI 全职业办公助理</h1>
              <span className="text-sm text-primary font-medium">专家级写作模型100000+</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="在全部中搜索写作模型"
                  className="pl-9 w-[260px] h-9 bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="sm" className="h-9">
                查找写作模型
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-6 pb-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-border bg-card">
          <Button
            variant={filterTab === "recommend" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab("recommend")}
            className="h-8"
          >
            推荐
          </Button>
          <Button
            variant={filterTab === "favorite" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab("favorite")}
            className="h-8"
          >
            我的收藏
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Hot Writing Section */}
          <div className="mb-8">
            <h2 className="text-base font-semibold text-foreground mb-4">热门写作</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* Most Favorited Section */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">收藏最多</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {favoriteTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: {
    id: number;
    icon: string;
    iconBg: string;
    title: string;
    desc: string;
    users: number;
    category: string;
    featured?: boolean;
  };
}

function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // 所有模板都跳转到通用写作页面，通过 URL 参数传递模板信息
    router.push(`/writing/xiaohongshu?template=${template.id}&title=${encodeURIComponent(template.title)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 text-muted-foreground hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Star className="h-4 w-4" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", template.iconBg)}>
          {getIconComponent(template.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{template.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{template.desc}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {template.users}人
        </span>
        <span className="truncate max-w-[100px]">{template.category}</span>
      </div>
    </div>
  );
}
