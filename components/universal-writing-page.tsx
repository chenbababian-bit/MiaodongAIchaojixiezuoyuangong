"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Save,
  X,
  FileText,
  Calendar,
  MessageSquare,
  MessageCircle,
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

// 模板配置接口
interface TemplateConfig {
  id: string;
  title: string;
  description: string;
  placeholder: string;
  apiEndpoint: string;
  examplePrompts: { id: number; text: string }[];
}

// 模板配置映射
const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  "1": {
    id: "1",
    title: "小红书爆款文案",
    description: "欢迎来到小红书爆款文案创作空间！让我们一起探索如何创作出能够吸引用户注意力的内容。请告诉我你想要聚焦的主题或领域,让我们开始创作吧!",
    placeholder: "请输入您想要创作的文案主题或内容描述...",
    apiEndpoint: "/api/xiaohongshu",
    examplePrompts: [
      { id: 1, text: "我是一名时尚博主,正在寻找能够引起共鸣的穿搭分享文案。" },
      { id: 2, text: "我是一名美食爱好者,需要一些能够让人垂涎三尺的食谱介绍文案。" },
      { id: 3, text: "我是一位旅行达人,想要创作一些能够激发人们旅行欲望的目的地介绍文案。" },
    ],
  },
  "2": {
    id: "2",
    title: "汇报材料",
    description: "欢迎来到汇报材料创作空间！帮助您撰写一份全面、准确、有针对性的政务汇报材料,为上级决策提供依据。",
    placeholder: "请输入汇报材料的主题、背景信息、关键数据等...",
    apiEndpoint: "/api/xiaohongshu", // 复用小红书API
    examplePrompts: [
      { id: 1, text: "我需要撰写一份关于季度工作进展的汇报材料。" },
      { id: 2, text: "请帮我准备一份项目实施情况的汇报文稿。" },
      { id: 3, text: "我要向领导汇报年度预算执行情况。" },
    ],
  },
  "3": {
    id: "3",
    title: "公众号文章撰写",
    description: "欢迎来到公众号文章创作空间！帮助您创作高质量的公众号文章,提升文章的吸引力和传播力。",
    placeholder: "请输入文章主题、目标受众、核心观点等...",
    apiEndpoint: "/api/wechat-article",
    examplePrompts: [
      { id: 1, text: "我想写一篇关于职场成长的公众号文章。" },
      { id: 2, text: "请帮我创作一篇关于健康生活方式的推文。" },
      { id: 3, text: "我需要写一篇产品介绍类的公众号文章。" },
    ],
  },
  "4": {
    id: "4",
    title: "短视频爆款文案",
    description: "欢迎来到短视频文案创作空间！帮助您设计能够迅速吸引观众注意力的短视频文案。",
    placeholder: "请输入视频主题、目标平台、受众群体等...",
    apiEndpoint: "/api/video",
    examplePrompts: [
      { id: 1, text: "我需要为抖音创作一条美食类短视频文案。" },
      { id: 2, text: "请帮我写一个知识分享类短视频的脚本。" },
      { id: 3, text: "我想做一个产品推广的短视频文案。" },
    ],
  },
  "5": {
    id: "5",
    title: "头条爆文",
    description: "欢迎来到头条爆文创作空间！帮助您创作出能够吸引大量阅读和互动的头条文章。",
    placeholder: "请输入文章主题、目标受众、关键卖点等...",
    apiEndpoint: "/api/xiaohongshu", // 复用小红书API
    examplePrompts: [
      { id: 1, text: "我想写一篇关于社会热点的头条文章。" },
      { id: 2, text: "请帮我创作一篇科技类的头条爆文。" },
      { id: 3, text: "我需要写一篇情感类的头条文章。" },
    ],
  },
  "6": {
    id: "6",
    title: "小红书爆款标题",
    description: "欢迎来到小红书标题创作空间！帮助您设计出能够吸引目标受众并提升点击率的爆款标题。",
    placeholder: "请输入内容主题、关键词、目标受众等...",
    apiEndpoint: "/api/xiaohongshu", // 复用小红书API
    examplePrompts: [
      { id: 1, text: "我需要为一篇护肤心得创作吸引人的标题。" },
      { id: 2, text: "请帮我写几个美妆教程的爆款标题。" },
      { id: 3, text: "我想为旅行攻略设计几个高点击率的标题。" },
    ],
  },
  "7": {
    id: "7",
    title: "商业计划书",
    description: "欢迎来到商业计划书创作空间！为您撰写一份详细、全面、具有说服力的商业计划书,帮助您获得投资和支持。",
    placeholder: "请输入项目名称、商业模式、市场分析、财务规划等...",
    apiEndpoint: "/api/wechat-article", // 复用公众号文章API
    examplePrompts: [
      { id: 1, text: "我需要为一个互联网创业项目撰写商业计划书。" },
      { id: 2, text: "请帮我准备一份连锁餐饮项目的商业计划。" },
      { id: 3, text: "我想写一份科技产品的商业计划书。" },
    ],
  },
  "8": {
    id: "8",
    title: "周/月/季度工作总结",
    description: "欢迎来到工作总结创作空间！为您提供详细、实用的工作总结模板,帮助您全面回顾工作成果。",
    placeholder: "请输入总结周期、主要工作内容、完成情况、数据指标等...",
    apiEndpoint: "/api/wechat-article", // 复用公众号文章API
    examplePrompts: [
      { id: 1, text: "我需要撰写本月的工作总结报告。" },
      { id: 2, text: "请帮我准备第一季度的工作总结。" },
      { id: 3, text: "我要写一份本周工作总结。" },
    ],
  },
  "9": {
    id: "9",
    title: "短视频黄金3秒开头",
    description: "欢迎来到短视频开头创作空间！帮助您设计出能够迅速吸引观众并降低跳出率的黄金3秒开头。",
    placeholder: "请输入视频主题、目标受众、核心卖点等...",
    apiEndpoint: "/api/video", // 复用视频API
    examplePrompts: [
      { id: 1, text: "我需要为一个美妆教程设计吸引人的开头。" },
      { id: 2, text: "请帮我创作一个知识分享视频的前3秒钩子。" },
      { id: 3, text: "我想为产品测评视频设计一个抓人眼球的开场。" },
    ],
  },
  "10": {
    id: "10",
    title: "品牌定位报告",
    description: "欢迎来到品牌定位报告创作空间！帮助您撰写一份全面、准确、有洞察力的品牌定位报告,为品牌发展提供战略指导。",
    placeholder: "请输入品牌名称、目标市场、竞争对手、核心价值等...",
    apiEndpoint: "/api/wechat-article", // 复用公众号文章API
    examplePrompts: [
      { id: 1, text: "我需要为一个新消费品牌撰写定位报告。" },
      { id: 2, text: "请帮我分析一个科技品牌的市场定位。" },
      { id: 3, text: "我想为餐饮品牌制定品牌定位策略。" },
    ],
  },
};

export function UniversalWritingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "1";
  const source = searchParams.get("source") || "hot";

  // 获取模板配置
  const config = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS["1"];

  const [contentInput, setContentInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleExampleClick = (text: string) => {
    setContentInput(text);
  };

  // 智能创作
  const handleSubmit = async () => {
    if (!contentInput.trim()) {
      setError("请输入内容描述");
      return;
    }

    setIsLoading(true);
    setError("");
    setCurrentResult("");
    setResultTab("current");

    try {
      const response = await fetch(config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentInput,
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
      return "/";
    } else if (source.startsWith("media-")) {
      return "/?category=media";
    } else if (source === "general") {
      return "/?category=general";
    } else {
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
              {config.title}
            </h1>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => handleExampleClick(config.examplePrompts[0].text)}
            >
              插入示例
            </Button>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              您可以试试这样提问：
            </p>
            <div className="space-y-2">
              {config.examplePrompts.map((prompt) => (
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
                描述内容
              </label>
              <Textarea
                placeholder={config.placeholder}
                className="min-h-[160px] resize-none"
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
              />
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
            isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  AI正在为您创作内容...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  预计需要10-20秒
                </p>
              </div>
            ) : currentResult ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <RichTextEditor
                  initialContent={currentResult}
                  className="flex-1"
                />
                <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: config.title,
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
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  AI创作结果会显示在这里,现在你只需要
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>1. 在左侧填好必要的信息,填写越详细,结果越准确哦</p>
                  <p>2. 点击智能创作按钮,静待AI妙笔生花,一般在10秒内搞定</p>
                </div>
              </div>
            )
          ) : (
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
