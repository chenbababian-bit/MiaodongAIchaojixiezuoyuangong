"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
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
  BookOpen,
  Video,
  Newspaper,
  PenTool,
  Briefcase,
  Calendar,
  Target,
  FileCheck,
  MessageSquare,
  Loader2,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Save,
  X,
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
import { historyStorage, HistoryItem } from "@/lib/history-storage";
import {
  xiaohongshuTemplates,
  wechatTemplates,
  toutiaoTemplates,
  weiboTemplates,
  zhihuTemplates,
  privateTemplates,
} from "@/components/media-page"; // 从media-page导入模板数据

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
    active: true,
  },
  {
    id: 2,
    icon: "report",
    iconBg: "bg-emerald-500",
    title: "汇报材料",
    desc: "撰写一份全面、准确、有...",
    active: false,
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

// 示例提问
const examplePrompts = [
  {
    id: 1,
    text: "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。",
  },
  {
    id: 2,
    text: "我是一名美食爱好者，需要一些能够让人垂涎三尺的食谱介绍文案。",
  },
  {
    id: 3,
    text: "我是一位旅行达人，想要创作一些能够激发人们旅行欲望的目的地介绍文案。",
  },
];

// 小红书旅游攻略专用示例
const travelExamplePrompts = [
  {
    id: 1,
    text: "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。",
  },
  {
    id: 2,
    text: "我是一名美食爱好者，需要一些能够让人垂涎三尺的食谱介绍文案。",
  },
  {
    id: 3,
    text: "我是一位旅行达人，想要创作一些能够激发人们旅行欲望的目的地介绍文案。",
  },
];

// 历史记录类型已从 @/lib/history-storage 导入

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
    case "weibo":
      return <MessageSquare className="h-5 w-5 text-white" />;
    case "zhihu":
      return <BookOpen className="h-5 w-5 text-white" />;
    case "private":
      return <Share2 className="h-5 w-5 text-white" />;
    default:
      return <FileText className="h-5 w-5 text-white" />;
  }
}

export function XiaohongshuWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "小红书爆款文案";
  const templateId = searchParams.get("template") || "1";
  const source = searchParams.get("source") || "hot"; // 获取source参数

  const [activeFilter, setActiveFilter] = useState("hot");
  const [activeTemplate, setActiveTemplate] = useState(parseInt(templateId));
  const [contentInput, setContentInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [searchQuery, setSearchQuery] = useState("");

  // 新增状态
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  // 旅游攻略专用表单状态
  const [travelDestination, setTravelDestination] = useState("");
  const [travelBudget, setTravelBudget] = useState("");
  const [travelCompanion, setTravelCompanion] = useState("");
  const [travelDays, setTravelDays] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  // 根据source参数动态获取模板列表
  const getTemplatesFromSource = () => {
    if (source === "hot") {
      // 热门写作的模板（来自首页）
      return sideTemplates;
    } else if (source.startsWith("media-")) {
      const platform = source.replace("media-", "");
      // 根据平台返回对应的模板
      switch (platform) {
        case "xiaohongshu":
          return xiaohongshuTemplates.map(t => ({
            id: t.id,
            icon: "xiaohongshu",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "wechat":
          return wechatTemplates.map(t => ({
            id: t.id,
            icon: "wechat",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "toutiao":
          return toutiaoTemplates.map(t => ({
            id: t.id,
            icon: "toutiao",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "weibo":
          return weiboTemplates.map(t => ({
            id: t.id,
            icon: "weibo",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "zhihu":
          return zhihuTemplates.map(t => ({
            id: t.id,
            icon: "zhihu",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        case "private":
          return privateTemplates.map(t => ({
            id: t.id,
            icon: "private",
            iconBg: t.color,
            title: t.title,
            desc: t.desc,
            active: false,
          }));
        default:
          return sideTemplates;
      }
    } else {
      // 默认返回热门写作模板
      return sideTemplates;
    }
  };

  // 动态模板列表
  const displayTemplates = getTemplatesFromSource();

  // 根据 URL 参数更新活动模板
  useEffect(() => {
    if (templateId) {
      setActiveTemplate(parseInt(templateId));
    }
  }, [templateId]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await historyStorage.getHistory(templateId);
        setHistory(historyData);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    };

    loadHistory();
  }, [templateId]);

  const handleExampleClick = (text: string) => {
    setContentInput(text);
  };

  // 智能创作
  const handleSubmit = async () => {
    // 根据模板ID验证不同的输入
    if (templateId === "101") {
      // 旅游攻略表单验证
      if (!travelDestination.trim()) {
        setError("请输入目的地");
        return;
      }
      if (!travelBudget.trim()) {
        setError("请输入预算");
        return;
      }
      if (!travelCompanion) {
        setError("请选择同行人");
        return;
      }
      if (!travelDays.trim()) {
        setError("请输入旅行天数");
        return;
      }
      if (!travelStyle) {
        setError("请选择风格偏好");
        return;
      }
    } else {
      // 其他模板的验证
      if (!contentInput.trim()) {
        setError("请输入文案主题或内容描述");
        return;
      }
    }

    setIsLoading(true);
    setError("");
    setCurrentResult("");
    setResultTab("current");

    try {
      // 根据模板ID选择API端点
      let apiEndpoint = "/api/xiaohongshu"; // 默认小红书API
      let requestBody: any = {};

      if (templateId === "101") {
        // 旅游攻略专用API
        apiEndpoint = "/api/travel-guide";
        // 将表单数据组合成结构化的描述
        const travelInfo = `📍 目的地 & 预算：${travelDestination}，预算${travelBudget}
👥 人物 & 天数：${travelCompanion === "couple" ? "情侣" : travelCompanion === "friends" ? "闺蜜" : travelCompanion === "family" ? "亲子" : travelCompanion === "solo" ? "独狼" : "其他"}，玩${travelDays}天
🎨 风格偏好：${travelStyle === "budget" ? "极致省钱干货" : "氛围感大片文案"}
${contentInput ? `\n补充说明：${contentInput}` : ""}`;
        requestBody = { content: travelInfo };
      } else if (templateId === "3") {
        // 公众号文章撰写
        apiEndpoint = "/api/wechat-article";
        requestBody = { content: contentInput };
      } else if (templateId === "4" || templateId === "9") {
        // 短视频相关模板，注意：实际应该跳转到视频页面，这里作为兜底
        apiEndpoint = "/api/video";
        requestBody = { content: contentInput };
      } else {
        requestBody = { content: contentInput };
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // 先读取响应文本，然后尝试解析为JSON
      const responseText = await response.text();

      // 检查响应状态
      if (!response.ok) {
        let errorMessage = "请求失败";
        try {
          const data = JSON.parse(responseText);
          errorMessage = data.error || `请求失败 (${response.status})`;
        } catch (jsonError) {
          // 如果不是JSON格式，直接使用文本内容
          errorMessage = responseText || `请求失败 (${response.status})`;
        }
        throw new Error(errorMessage);
      }

      // 解析成功的响应
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error("服务器返回了无效的响应格式");
      }

      if (!data.result) {
        throw new Error("AI返回结果为空，请重试");
      }

      setCurrentResult(data.result);

      // 添加到历史记录
      try {
        const contentForHistory = templateId === "101"
          ? `${travelDestination} | ${travelCompanion} | ${travelDays}天 | ${travelStyle}`
          : contentInput;

        const newHistoryItem = await historyStorage.addHistory(
          templateId,
          templateTitle,
          contentForHistory,
          data.result
        );
        setHistory((prev) => [newHistoryItem, ...prev]);
      } catch (historyError) {
        console.error('保存历史记录失败:', historyError);
        // 历史记录保存失败不影响主流程
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "创作失败，请重试");
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

  // 删除历史记录
  const handleDeleteHistory = async (id: number) => {
    try {
      await historyStorage.deleteHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('删除历史记录失败:', error);
    }
  };

  // 加载历史记录到编辑器
  const handleLoadHistory = (item: HistoryItem) => {
    setCurrentResult(item.result);
    setResultTab("current");
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 根据source参数判断返回路径
  const getBackPath = () => {
    if (source === "hot") {
      // 从热门写作来的，返回首页
      return "/";
    } else if (source.startsWith("media-")) {
      // 从自媒体分类来的，返回自媒体分类页
      return "/?category=media";
    } else {
      // 默认返回首页
      return "/";
    }
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Center - Form Area */}
      <div className="w-[60%] flex flex-col overflow-hidden">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => router.push(getBackPath())}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回</span>
          </button>

          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">
              {templateTitle}
            </h1>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() =>
                handleExampleClick(
                  "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。"
                )
              }
            >
              插入示例
            </Button>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              {templateId === "101"
                ? "✨ 嘿！欢迎来到小红书旅游攻略创作空间！我不仅是一名旅游爱好者，更是一位精通小红书流量密码的内容架构师。准备好了吗？让我们一起打造下一篇万赞笔记吧！🌟"
                : `欢迎来到${templateTitle}创作空间！让我们一起探索如何创作出能够吸引用户注意力的内容。请告诉我你想要聚焦的主题或领域，让我们开始创作吧！`
              }
            </p>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            {/* 旅游攻略专用表单 */}
            {templateId === "101" ? (
              <>
                {/* 目的地 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📍 目的地
                  </label>
                  <Input
                    placeholder="例如：成都、大理、三亚..."
                    value={travelDestination}
                    onChange={(e) => setTravelDestination(e.target.value)}
                  />
                </div>

                {/* 预算 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    💰 预算
                  </label>
                  <Input
                    placeholder="例如：3000元、5000-8000元、穷游..."
                    value={travelBudget}
                    onChange={(e) => setTravelBudget(e.target.value)}
                  />
                </div>

                {/* 同行人 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    👥 同行人
                  </label>
                  <Select value={travelCompanion} onValueChange={setTravelCompanion}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择同行人" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="couple">情侣</SelectItem>
                      <SelectItem value="friends">闺蜜</SelectItem>
                      <SelectItem value="family">亲子</SelectItem>
                      <SelectItem value="solo">独狼</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 旅行天数 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    📅 旅行天数
                  </label>
                  <Input
                    type="number"
                    placeholder="例如：3、5、7..."
                    value={travelDays}
                    onChange={(e) => setTravelDays(e.target.value)}
                    min="1"
                  />
                </div>

                {/* 风格偏好 */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <span className="text-red-500 mr-1">*</span>
                    🎨 风格偏好
                  </label>
                  <Select value={travelStyle} onValueChange={setTravelStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择风格偏好" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">极致省钱干货</SelectItem>
                      <SelectItem value="aesthetic">氛围感大片文案</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 额外描述（可选） */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                    补充说明（可选）
                  </label>
                  <Textarea
                    placeholder="您可以补充更多信息，比如特殊需求、想去的景点、饮食偏好等..."
                    className="min-h-[100px] resize-none"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>
              </>
            ) : (
              /* 其他模板的通用表单 */
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center">
                  <span className="text-red-500 mr-1">*</span>
                  描述内容
                </label>
                <Textarea
                  placeholder="请输入您想要创作的文案主题或内容描述..."
                  className="min-h-[160px] resize-none"
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                />
              </div>
            )}

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
      <div className="w-[40%] border-l border-border bg-card flex flex-col relative">
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
                  AI正在为您创作爆款文案...
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
                        // 分享功能
                        if (navigator.share) {
                          navigator.share({
                            title: "小红书爆款文案",
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
                        // 保存到历史记录
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
                  AI创作结果会在显示这里，现在你只需要
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    1. 在左侧填好必要的信息，填写越详细，结果越准确哦
                  </p>
                  <p>
                    2. 点击智能创作按钮，静待AI妙笔生花，一般在10秒内搞定
                  </p>
                </div>
              </div>
            )
          ) : (
            // 历史创作结果
            <ScrollArea className="h-full">
              {history.length > 0 ? (
                <div className="p-4 space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.timestamp)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLoadHistory(item);
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            加载
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(item.result);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(item.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground font-medium mb-1 line-clamp-1">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.result.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    暂无历史创作记录
                  </p>
                </div>
              )}
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
