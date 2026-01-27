"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MediaPage } from "@/components/media-page";
import { MarketingPage } from "@/components/marketing-page";
import { GeneralWritingPage } from "@/components/general-writing-page";
import {
  Search,
  Star,
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
  {
    id: 2,
    icon: "report",
    iconBg: "bg-emerald-500",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有针对性的政务汇报材料，为上级决策提供依据...",
    users: 3470,
    category: "通用写作/政务公文",
  },
  {
    id: 16,
    icon: "news",
    iconBg: "bg-blue-500",
    title: "新闻稿",
    desc: "撰写准确、清晰、具有影响力的政务新闻稿，及时传达政务信息...",
    users: 885,
    category: "通用写作/政务公文",
  },
  {
    id: 17,
    icon: "letter",
    iconBg: "bg-purple-500",
    title: "感谢信",
    desc: "撰写一封符合政务规范、情感真挚、表达清晰的感谢信...",
    users: 983,
    category: "通用写作/政务公文",
  },
  {
    id: 10,
    icon: "brand",
    iconBg: "bg-pink-500",
    title: "品牌定位报告",
    desc: "撰写一份详细、准确且具有操作性的品牌定位报告，为品牌的发展提供有力的指导...",
    users: 1339,
    category: "营销/品牌",
  },
  {
    id: 6,
    icon: "title",
    iconBg: "bg-red-500",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众、提高点击率和互动率的标题...",
    users: 1471,
    category: "自媒体/自媒体文案",
  },
];

// 最新推出模板
const newestTemplates = [
  {
    id: 18,
    icon: "shopee",
    iconBg: "bg-orange-500",
    title: "描述标题",
    desc: "Shopee专家，将你的商品营销给经验和创新串进一个极具吸引力的标题...",
    users: 1072,
    category: "电商/跨境电商",
  },
  {
    id: 19,
    icon: "shopee",
    iconBg: "bg-orange-500",
    title: "产品描述",
    desc: "Shopee顶级运营专家，根据您提供的产品信息编写一段精准且引人入胜的产品描述...",
    users: 1126,
    category: "电商/跨境电商",
  },
  {
    id: 20,
    icon: "shopee",
    iconBg: "bg-orange-500",
    title: "Shopee Listing写作与优化",
    desc: "根据提供的关键词、类目、商品卖点信息，为你生成通顺流畅的语言表达，提升商品曝光率...",
    users: 1250,
    category: "电商/跨境电商",
  },
  {
    id: 21,
    icon: "shopee",
    iconBg: "bg-orange-500",
    title: "Shopee Listing写作与优化...",
    desc: "根据提供的关键词、类目、商品卖点信息，为你生成通顺流畅的语言表达，提升商品曝光率...",
    users: 1210,
    category: "电商/跨境电商",
  },
  {
    id: 22,
    icon: "ebay",
    iconBg: "bg-blue-500",
    title: "eBay客户消息回复",
    desc: "eBay客户消息回复",
    users: 647,
    category: "电商/跨境电商",
  },
  {
    id: 23,
    icon: "ebay",
    iconBg: "bg-blue-500",
    title: "eBay差评邮件回复",
    desc: "eBay差评邮件回复",
    users: 571,
    category: "电商/跨境电商",
  },
  {
    id: 24,
    icon: "ebay",
    iconBg: "bg-blue-500",
    title: "标题生成",
    desc: "结合产品名称、品牌、卖点和关键词，以创新和吸引力为核心，编写出一条有吸引力的标题...",
    users: 287,
    category: "电商/跨境电商",
  },
  {
    id: 25,
    icon: "ebay",
    iconBg: "bg-blue-500",
    title: "描述生成",
    desc: "根据提供的产品信息，包括产品名称、品牌、卖点和关键词等，编写一段通顺、吸引人的产品描述...",
    users: 304,
    category: "电商/跨境电商",
  },
  {
    id: 26,
    icon: "ebay",
    iconBg: "bg-blue-500",
    title: "产品特点生成",
    desc: "根据提供的产品信息，编出构思并编写出一条列语句通顺、吸引人的产品特点...",
    users: 344,
    category: "电商/跨境电商",
  },
  {
    id: 27,
    icon: "ebay",
    iconBg: "bg-blue-500",
    title: "标题优化",
    desc: "运用专业技能和独特见解，对提供的产品信息进行深入分析，并结合产品名称、品牌、卖点和关键词等要素...",
    users: 311,
    category: "电商/跨境电商",
  },
];

// 平台精选模板
const featuredTemplates = [
  {
    id: 28,
    icon: "resume",
    iconBg: "bg-orange-500",
    title: "求职简历优化",
    desc: "帮助求职者优化简历，提高其在求职过程中的竞争力，增加获得面试机会的可能性...",
    users: 2013,
    category: "通用写作/职场办公",
  },
  {
    id: 29,
    icon: "douyin",
    iconBg: "bg-black",
    title: "企业抖音矩阵运营战略图",
    desc: "制定《企业抖音矩阵运营战略图》，帮助企业在抖音平台上实现品牌的全面覆盖和用户的深度触达...",
    users: 226,
    category: "自媒体/短视频文案",
  },
  {
    id: 30,
    icon: "company",
    iconBg: "bg-green-500",
    title: "企业简介内容策划",
    desc: "撰写一份全面、准确、有吸引力的企业简介，突出企业的核心价值、业务特色和发展愿景...",
    users: 102,
    category: "营销/品牌",
  },
  {
    id: 7,
    icon: "business",
    iconBg: "bg-purple-500",
    title: "商业计划书",
    desc: "为客户撰写一份详细、全面、具有可行性的商业计划书，帮助客户明确商业目标...",
    users: 1316,
    category: "金融保险/风险投资",
  },
  {
    id: 31,
    icon: "slogan",
    iconBg: "bg-red-500",
    title: "品牌定位语+品牌口号slogan",
    desc: "帮助用户深入理解各种品牌定位策略，并能够根据实际情况灵活运用合理单用...",
    users: 1459,
    category: "营销/品牌",
  },
  {
    id: 32,
    icon: "marketing",
    iconBg: "bg-green-500",
    title: "事件整合营销策划",
    desc: "通过整合营销事件性质品牌知名度，获取潜在客户和促进销售转化...",
    users: 1141,
    category: "营销/品牌",
  },
  {
    id: 33,
    icon: "amazon",
    iconBg: "bg-black",
    title: "亚马逊客户评论分析",
    desc: "根据输入的买家评论信息，分析商品的优缺点、按销售点、提高品的销售量...",
    users: 461,
    category: "电商/跨境电商",
  },
  {
    id: 34,
    icon: "amazon",
    iconBg: "bg-black",
    title: "亚马逊消费者洞察专家",
    desc: "提供当地消费者详细画像，包括使用场景、购买决策因素、商家可以通过了解消费者需求...",
    users: 364,
    category: "电商/跨境电商",
  },
  {
    id: 35,
    icon: "amazon",
    iconBg: "bg-black",
    title: "品牌信息收集和总结",
    desc: "调研亚马逊的产品品牌的详细信息",
    users: 665,
    category: "电商/跨境电商",
  },
  {
    id: 36,
    icon: "amazon",
    iconBg: "bg-black",
    title: "目标用户画像",
    desc: "根据产品和产品特点、对目标用户画像，帮助卖家更好的满足用户需求，制定科学的营销策略...",
    users: 575,
    category: "电商/跨境电商",
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
    case "news":
      return <Newspaper className="h-5 w-5 text-white" />;
    case "letter":
      return <FileText className="h-5 w-5 text-white" />;
    case "shopee":
      return <ShoppingBag className="h-5 w-5 text-white" />;
    case "ebay":
      return <ShoppingCart className="h-5 w-5 text-white" />;
    case "resume":
      return <FileText className="h-5 w-5 text-white" />;
    case "douyin":
      return <Video className="h-5 w-5 text-white" />;
    case "company":
      return <Building className="h-5 w-5 text-white" />;
    case "slogan":
      return <PenTool className="h-5 w-5 text-white" />;
    case "marketing":
      return <TrendingUp className="h-5 w-5 text-white" />;
    case "amazon":
      return <ShoppingBag className="h-5 w-5 text-white" />;
    default:
      return <FileText className="h-5 w-5 text-white" />;
  }
}

export function WritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState("home");
  const [activeFilter, setActiveFilter] = useState("hot");
  const [filterTab, setFilterTab] = useState<"hot" | "favorite">("hot");
  const [searchQuery, setSearchQuery] = useState("");

  // 从URL参数初始化分类
  useEffect(() => {
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // 创建各个区域的引用
  const hotRef = useRef<HTMLDivElement>(null);
  const favoriteRef = useRef<HTMLDivElement>(null);
  const newestRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 滚动监听，自动更新左侧导航高亮
  useEffect(() => {
    // 如果是自媒体、营销或通用写作页面，不需要滚动监听
    if (activeCategory === "media" || activeCategory === "marketing" || activeCategory === "general") return;

    const contentElement = contentRef.current;
    if (!contentElement) return;

    // 使用 Intersection Observer 来检测可见区域
    const observerOptions = {
      root: contentElement,
      rootMargin: "-20% 0px -70% 0px", // 当区域进入视口上方 20% 位置时触发
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute("data-section");
          if (sectionId) {
            setActiveFilter(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 观察所有区域
    const sections = [
      hotRef.current,
      favoriteRef.current,
      newestRef.current,
      featuredRef.current,
    ];

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [activeCategory]);

  // 点击左侧导航，平滑滚动到对应区域
  const scrollToSection = (filterId: string) => {
    const refMap: { [key: string]: React.RefObject<HTMLDivElement | null> } = {
      hot: hotRef,
      favorite: favoriteRef,
      newest: newestRef,
      featured: featuredRef,
    };

    const targetRef = refMap[filterId];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Top Category Navigation - Always Visible */}
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
                onClick={() => {
                  setActiveCategory(cat.id);
                }}
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

      {/* Main Content Area - Conditional Rendering */}
      {activeCategory === "media" ? (
        // 自媒体页面
        <MediaPage />
      ) : activeCategory === "marketing" ? (
        // 营销页面
        <MarketingPage />
      ) : activeCategory === "general" ? (
        // 通用写作页面
        <GeneralWritingPage />
      ) : (
        // 其他分类的默认页面
        <div className="flex flex-1 overflow-hidden">{/* Left Filter Sidebar */}
      <div className="w-48 border-r border-border bg-card flex flex-col">
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-1">首页/</p>
          <p className="text-sm font-medium text-foreground">推荐</p>
        </div>
        <nav className="flex-1 px-2">
          {sideFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => scrollToSection(filter.id)}
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
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {/* Filter Tabs */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-border bg-card">
          <Button
            variant={filterTab === "hot" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterTab("hot")}
            className="h-8"
          >
            热门写作
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

        {/* Content - All Sections */}
        <div className="p-6">
          {/* 热门写作 Section */}
          <div ref={hotRef} data-section="hot" className="mb-12 scroll-mt-6">
            <h2 className="text-base font-semibold text-foreground mb-4">热门写作</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {templates.map((template) => (
                <TemplateCard key={`hot-${template.id}`} template={template} />
              ))}
            </div>
          </div>

          {/* 收藏最多 Section */}
          <div ref={favoriteRef} data-section="favorite" className="mb-12 scroll-mt-6">
            <h2 className="text-base font-semibold text-foreground mb-4">收藏最多</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteTemplates
                .filter((template) =>
                  activeCategory === "home" ||
                  activeCategory === "media" ? template.category?.includes("自媒体") : true
                )
                .map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
            </div>
          </div>

          {/* 最新推出 Section */}
          <div ref={newestRef} data-section="newest" className="mb-12 scroll-mt-6">
            <h2 className="text-base font-semibold text-foreground mb-4">最新推出</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {newestTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>

          {/* 平台精选 Section */}
          <div ref={featuredRef} data-section="featured" className="mb-12 scroll-mt-6">
            <h2 className="text-base font-semibold text-foreground mb-4">平台精选</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
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
    // 统一路由映射表
    const routeMap: Record<number, string> = {
      1: "/writing/xiaohongshu",      // 小红书爆款文案
      2: "/writing/report",            // 汇报材料
      3: "/writing/wechat",            // 公众号文章撰写
      4: "/writing/video",             // 短视频爆款文案
      5: "/writing/toutiao",           // 头条爆文
      6: "/writing/title",             // 小红书爆款标题
      7: "/writing/business-plan",     // 商业计划书
      8: "/writing/work-summary",      // 周/月/季度工作总结
      9: "/writing/video-hook",        // 短视频黄金3秒开头
      10: "/writing/brand-positioning", // 品牌定位报告
    };

    const route = routeMap[template.id] || "/writing/xiaohongshu";
    router.push(`${route}?template=${template.id}&title=${encodeURIComponent(template.title)}&source=hot`);
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
      <div className="flex items-center text-xs text-muted-foreground">
        <span className="truncate max-w-[100px]">{template.category}</span>
      </div>
    </div>
  );
}
