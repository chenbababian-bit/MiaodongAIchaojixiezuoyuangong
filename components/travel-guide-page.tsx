"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// 示例提示
const EXAMPLE_PROMPTS = [
  "我是一名时尚博主，正在寻找能够引起共鸣的穿搭分享文案。",
  "我是一名美食爱好者，需要一些能够让人垂涎三尺的食谱介绍文案。",
  "我是一位旅行达人，想要创作一些能够激发人们旅行欲望的目的地介绍文案。",
  "我计划去成都旅游3天，预算3000元，和闺蜜一起，想要极致省钱干货攻略。",
  "我想去大理度假5天，预算8000元，情侣出行，想要氛围感大片文案风格。",
  "我要带孩子去三亚玩7天，预算15000元，需要亲子友好的旅游攻略。",
];

export function TravelGuidePage() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("请输入您想要创作的内容描述");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/travel-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失败");
      }

      setResult(data.result);
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const handleExampleClick = (example: string) => {
    setContent(example);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 标题区域 */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          小红书旅游攻略
        </h1>
        <p className="text-muted-foreground text-lg">
          欢迎来到小红书旅游攻略创作空间！让我们一起探索如何创作出能够吸引用户注意力的内容。请告诉我您想要聚焦的主题或领域，让我们开始创作吧！
        </p>
      </div>

      {/* 示例提示卡片 */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground">您可以试试这样提问：</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className={cn(
                "p-4 text-left text-sm rounded-lg border-2 transition-all",
                "hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-950/20",
                "focus:outline-none focus:ring-2 focus:ring-pink-500",
                "bg-card"
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            描述内容
          </label>
          <Textarea
            id="content"
            placeholder="请输入您想要创作的文案主题或内容描述..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] resize-none"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              AI 正在创作中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              开始创作
            </>
          )}
        </Button>
      </form>

      {/* 结果显示区域 */}
      {(loading || result) && (
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              生成结果
            </h2>
            {result && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
              <p className="text-muted-foreground">AI 正在为您生成专业的小红书内容...</p>
              <p className="text-sm text-muted-foreground">这可能需要 10-30 秒，请耐心等待</p>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                {result}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
