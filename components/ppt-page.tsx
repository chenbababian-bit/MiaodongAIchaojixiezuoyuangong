"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Presentation,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

const tabs = [
  { id: "basic", label: "基础", icon: Sparkles },
  { id: "enhanced", label: "增强", icon: FileText },
  { id: "custom", label: "预入", icon: ImageIcon },
  { id: "advanced", label: "自定义", icon: Presentation },
];

const historyTabs = [
  { id: "all", label: "全部" },
  { id: "generating", label: "生成中" },
  { id: "success", label: "生成成功" },
  { id: "failed", label: "生成失败" },
];

export function PPTPage() {
  const [activeTab, setActiveTab] = useState("basic");
  const [activeHistoryTab, setActiveHistoryTab] = useState("all");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">AI一键生成PPT</span>{" "}
            <span className="text-foreground">只需一段文本</span>
          </h1>
          <p className="text-muted-foreground mb-1">
            输入主题描述，快速生成专属PPT
          </p>
          <p className="text-xs text-muted-foreground">
            PPT内容由AI生成，仅供参考
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="mb-4">
            <label className="text-sm font-medium text-foreground mb-2 block">
              简单输入一个标题即可生成PPT
            </label>
            <Textarea
              placeholder="请输入主题描述"
              className="min-h-[120px] resize-none"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="w-full h-11"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成
              </>
            )}
          </Button>
        </div>

        {/* History Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">生成记录</h2>

          {/* History Tabs */}
          <div className="flex gap-2 mb-6">
            {historyTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveHistoryTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeHistoryTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Presentation className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              暂无生成记录，请输入主题描述生成PPT
            </p>
          </div>
        </div>

        {/* New PPT Card */}
        <div className="mt-6 bg-card border border-border rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Presentation className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">新建PPT</h3>
          <p className="text-sm text-muted-foreground mb-4">
            点击简单输入一个标题即可生成PPT
          </p>
        </div>
      </div>
    </div>
  );
}
