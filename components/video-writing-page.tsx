"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Search,
  FileText,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Video,
  Loader2,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Save,
  X,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/rich-text-editor";
import { videoContentTemplates } from "@/lib/video-templates";

// 顶部筛选标签
const topFilters = [
  { id: "hot", label: "热门写作" },
  { id: "favorite", label: "收藏最多" },
  { id: "newest", label: "最新推出" },
  { id: "featured", label: "平台精选" },
];

// 视频类型选项
const videoTypes = [
  { value: "oral", label: "口播" },
  { value: "plot", label: "剧情" },
  { value: "vlog", label: "Vlog" },
  { value: "product", label: "带货" },
  { value: "tutorial", label: "教程" },
  { value: "entertainment", label: "娱乐" },
];

// 目标选项
const goalOptions = [
  { value: "fans", label: "涨粉" },
  { value: "monetization", label: "变现" },
  { value: "interaction", label: "互动" },
  { value: "brand", label: "品牌宣传" },
];

// 示例提问
const examplePrompts = [
  {
    id: 1,
    text: "我想拍一个美妆产品带货视频,目标观众是25-35岁职场女性,希望提高购买转化率。",
  },
  {
    id: 2,
    text: "需要一个职场干货类口播脚本,关于时间管理技巧,目标是涨粉和提高互动。",
  },
  {
    id: 3,
    text: "想做一个美食探店Vlog,突出餐厅特色和用餐体验,吸引本地吃货关注。",
  },
];

export function VideoWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "短视频爆款文案";
  const templateId = searchParams.get("template") || "1001";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  const [activeFilter, setActiveFilter] = useState("hot");
  const [activeTemplate, setActiveTemplate] = useState(parseInt(templateId));
  const [contentInput, setContentInput] = useState("");
  const [videoType, setVideoType] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [searchQuery, setSearchQuery] = useState("");

  // 新增状态
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // 根据 URL 参数更新活动模板
  useEffect(() => {
    if (templateId) {
      setActiveTemplate(parseInt(templateId));
    }
  }, [templateId]);

  const handleExampleClick = (text: string) => {
    setContentInput(text);
  };

  // 智能创作
  const handleSubmit = async () => {
    if (!contentInput.trim()) {
      setError("请输入视频主题或内容描述");
      return;
    }

    setIsLoading(true);
    setError("");
    setCurrentResult("");
    setResultTab("current");

    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentInput,
          videoType: videoType,
          audience: audience,
          goal: goal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setCurrentResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创作失败,请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 复制结果
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 根据source参数判断返回路径
  const getBackPath = () => {
    if (source === "hot") {
      // 从热门写作来的，返回首页
      return "/";
    } else if (source.startsWith("media-") || source.startsWith("video-")) {
      // 从分类来的，返回自媒体分类页
      return "/?category=media";
    } else {
      // 默认返回首页
      return "/";
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Left Sidebar - Template List */}
      <div className="w-[280px] border-r border-border bg-card flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => router.push(getBackPath())}
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
          {videoContentTemplates
            .filter((template) =>
              template.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  router.push(
                    `/writing/video?template=${template.id}&title=${encodeURIComponent(template.title)}&source=${source}`
                  );
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
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl",
                    template.color
                  )}
                >
                  {template.icon}
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
              {templateTitle}
            </h1>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => handleExampleClick(examplePrompts[0].text)}
            >
              插入示例
            </Button>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              欢迎来到{templateTitle}
              创作空间！我不写废话,只产出能留住注意力的爆款。前3秒定生死,结尾定转化。请告诉我您的视频主题、目标观众和核心目标,让我们开始创作吧！
            </p>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              您可以试试这样提问:
            </p>
            <div className="space-y-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleExampleClick(prompt.text)}
                  className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group w-full text-left"
                >
                  <span className="flex-1">{prompt.text}</span>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                <span className="text-red-500 mr-1">*</span>
                视频主题
              </label>
              <Textarea
                placeholder="请输入您想要创作的视频主题或内容描述..."
                className="min-h-[120px] resize-none"
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
              />
            </div>

            {/* Video Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                视频类型 (可选)
              </label>
              <Select value={videoType} onValueChange={setVideoType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择视频类型" />
                </SelectTrigger>
                <SelectContent>
                  {videoTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                目标观众 (可选)
              </label>
              <Input
                placeholder="例如: 25-35岁职场女性"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>

            {/* Goal */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                核心目标 (可选)
              </label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择核心目标" />
                </SelectTrigger>
                <SelectContent>
                  {goalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Model Selection */}
            <div>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">
                    厉害猫AI-极速模型 (消耗0.2算力/1000字符)
                  </SelectItem>
                  <SelectItem value="standard">
                    厉害猫AI-标准模型 (消耗0.5算力/1000字符)
                  </SelectItem>
                  <SelectItem value="advanced">
                    厉害猫AI-高级模型 (消耗1.0算力/1000字符)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full h-11 text-base"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI创作中...
                </>
              ) : (
                "智能创作"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Results Area */}
      <div className="w-[400px] border-l border-border bg-card flex flex-col relative">
        {/* Result Tabs */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={resultTab === "current" ? "default" : "outline"}
              size="sm"
              onClick={() => setResultTab("current")}
              className="h-8"
            >
              本次创作结果
            </Button>
            <Button
              variant={resultTab === "history" ? "default" : "outline"}
              size="sm"
              onClick={() => setResultTab("history")}
              className="h-8"
            >
              历史创作结果
            </Button>
          </div>
        </div>

        {/* Result Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {resultTab === "current" ? (
            // 本次创作结果
            isLoading ? (
              // 加载状态
              <div className="flex flex-col items-center justify-center h-full p-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  AI正在为您创作爆款视频脚本...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  预计需要10-20秒
                </p>
              </div>
            ) : currentResult ? (
              // 显示富文本编辑器结果
              <div className="flex-1 flex flex-col overflow-hidden">
                <RichTextEditor
                  initialContent={currentResult}
                  className="flex-1"
                />
                {/* 底部操作按钮 */}
                <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: "短视频爆款文案",
                            text: currentResult,
                          });
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      分享
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      重写
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => handleCopy(currentResult)}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-500" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          复制
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setCurrentResult("");
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        alert("已保存");
                      }}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // 空状态
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  AI创作结果会在显示这里,现在你只需要
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>1. 在左侧填好必要的信息,填写越详细,结果越准确哦</p>
                  <p>2. 点击智能创作按钮,静待AI妙笔生花,一般在10秒内搞定</p>
                </div>
              </div>
            )
          ) : (
            // 历史创作结果
            <ScrollArea className="h-full">
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  暂无历史创作记录
                </p>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Customer Service Button */}
        <div className="absolute bottom-20 right-4">
          <Button variant="outline" size="sm" className="rounded-full px-4">
            <MessageCircle className="h-4 w-4 mr-2" />
            客服
          </Button>
        </div>
      </div>
    </div>
  );
}
