"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  BookOpen,
  FileCheck,
  MessageCircle,
  Video,
  Newspaper,
  PenTool,
  Briefcase,
  Calendar,
  Target,
} from "lucide-react";

// 顶部筛选标签
const topFilters = [
  { id: "hot", label: "热门写作" },
  { id: "favorite", label: "收藏最多" },
  { id: "newest", label: "最新推出" },
  { id: "featured", label: "平台精选" },
];

// 左侧写作模板列表
const sideTemplates = [
  {
    id: 1,
    icon: "xiaohongshu",
    iconBg: "bg-red-500",
    title: "小红书爆款文案",
    desc: "创作出能够吸引用户注意...",
    active: false,
  },
  {
    id: 2,
    icon: "report",
    iconBg: "bg-emerald-500",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有...",
    active: true,
  },
  {
    id: 3,
    icon: "wechat",
    iconBg: "bg-green-500",
    title: "公众号文章撰写",
    desc: "创作高质量的公众号文章...",
    active: false,
  },
  {
    id: 4,
    icon: "video",
    iconBg: "bg-amber-500",
    title: "短视频爆款文案",
    desc: "设计能够迅速吸引观众注...",
    active: false,
  },
  {
    id: 5,
    icon: "toutiao",
    iconBg: "bg-red-600",
    title: "头条爆文",
    desc: "帮助用户创作出能够吸引...",
    active: false,
  },
  {
    id: 6,
    icon: "title",
    iconBg: "bg-red-500",
    title: "小红书爆款标题",
    desc: "设计出能够吸引目标受众...",
    active: false,
  },
  {
    id: 7,
    icon: "business",
    iconBg: "bg-purple-500",
    title: "商业计划书",
    desc: "为客户撰写一份详细、全...",
    active: false,
  },
  {
    id: 8,
    icon: "weekly",
    iconBg: "bg-orange-500",
    title: "周/月/季度工作总结",
    desc: "为用户提供详细、实用的...",
    active: false,
  },
  {
    id: 9,
    icon: "hook",
    iconBg: "bg-amber-500",
    title: "短视频黄金3秒开头",
    desc: "设计出能够迅速吸引观众...",
    active: false,
  },
];

// 示例提示
const examplePrompts = [
  {
    id: 1,
    text: "我是负责城市环保工作的，需要一份关于近期垃圾保工作的汇报材料，包括工作进展、成果和面临的问题。",
  },
  {
    id: 2,
    text: "我在民政部门工作，想要一份关于社会救助工作的汇报材料，涵盖政策落实情况、救助效果和改进建议。",
  },
  {
    id: 3,
    text: "我负责文化旅游方面的政务工作，需要一个汇报材料，讲述文化旅游产业发展现状、取得的成绩以及未来规划。",
  },
];

function getIconComponent(iconType: string) {
  switch (iconType) {
    case "xiaohongshu":
      return <Image src="/20240723180934ae8ed2830.png" alt="小红书" width={20} height={20} className="object-contain" />;
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
    default:
      return <FileText className="h-5 w-5 text-white" />;
  }
}

export function ReportWritingPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("hot");
  const activeTemplate = 2; // 汇报材料的模板 ID
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState("");
  const [model, setModel] = useState("fast");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultTab, setResultTab] = useState<"current" | "history">("current");

  const handleGenerate = () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleExampleClick = (text: string) => {
    setContent(text);
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Sidebar - Template List */}
      <div className="w-[280px] border-r border-border bg-card flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => router.push("/?category=general")}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回分类页</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="请输入关键词搜索"
              className="pl-9 h-9 bg-background text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sideTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                // 根据模板类型跳转到对应页面
                if (template.id === 2) {
                  // 汇报材料
                  router.push(`/writing/report?template=${template.id}&title=${encodeURIComponent(template.title)}`);
                } else if (template.id === 4 || template.id === 9) {
                  // 短视频相关模板跳转到视频页面
                  router.push(`/writing/video?template=${template.id}&title=${encodeURIComponent(template.title)}`);
                } else if (template.id === 3) {
                  // 公众号文章跳转到小红书页面
                  router.push(`/writing/xiaohongshu?template=${template.id}&title=${encodeURIComponent(template.title)}`);
                } else {
                  // 其他模板跳转到小红书写作页面
                  router.push(`/writing/xiaohongshu?template=${template.id}&title=${encodeURIComponent(template.title)}`);
                }
              }}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all mb-1",
                activeTemplate === template.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  template.iconBg
                )}
              >
                {getIconComponent(template.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-medium text-sm truncate",
                    activeTemplate === template.id
                      ? "text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {template.title}
                </h3>
                <p
                  className={cn(
                    "text-xs truncate mt-0.5",
                    activeTemplate === template.id
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {template.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center - Form Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Filter Tabs */}
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-2">
            {topFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className="h-8"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              汇报材料
            </h1>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() =>
                handleExampleClick(examplePrompts[0].text)
              }
            >
              插入示例
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            欢迎来到政务汇报材料撰写服务！作为您的专业助手，我将帮助您撰写一份高质量的政务汇报材料。请您提供相关政务工作的基本信息，如工作领域、汇报内容期，重点内容等，以便我更好地为您服务。
          </p>

          {/* Result Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={resultTab === "current" ? "default" : "ghost"}
              size="sm"
              onClick={() => setResultTab("current")}
              className="h-8"
            >
              本次创作结果
            </Button>
            <Button
              variant={resultTab === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setResultTab("history")}
              className="h-8"
            >
              历史创作结果
            </Button>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3">您可以试试这样描述：</p>
            <div className="space-y-2">
              {examplePrompts.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleExampleClick(example.text)}
                  className="flex items-center gap-2 w-full p-3 text-left text-sm text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group"
                >
                  <span className="flex-1">{example.text}</span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              描述内容
            </label>
            <Textarea
              placeholder="我是负责城市环保工作的，需要一份关于近期垃圾保工作的汇报材料，包括工作进展、成果和面临的问题。"
              className="min-h-[200px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Model Selection */}
          <div className="mb-4">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">
                  秒懂AI超级员工-极速模型 (消耗0.2算力/1000字符)
                </SelectItem>
                <SelectItem value="standard">
                  秒懂AI超级员工-标准模型 (消耗0.5算力/1000字符)
                </SelectItem>
                <SelectItem value="advanced">
                  秒懂AI超级员工-高级模型 (消耗1.0算力/1000字符)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!content.trim() || isGenerating}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                生成中...
              </>
            ) : (
              "智能创作"
            )}
          </Button>
        </div>
      </div>

      {/* Right Column - Output */}
      <div className="w-[480px] border-l border-border bg-muted/30 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <p className="text-muted-foreground mb-2">
            AI创作结果会在这里，现在你只需要
          </p>
          <ol className="text-sm text-muted-foreground text-left space-y-2">
            <li>1. 在左侧描述你想要的信息，填写越详细，结果越准确</li>
            <li>
              2. 点击智能创作按钮，静待AI为笔生花，一般在10秒内搞定
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
