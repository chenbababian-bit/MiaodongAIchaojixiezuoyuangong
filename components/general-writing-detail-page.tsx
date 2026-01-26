"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Share2,
  Save,
  X,
  MessageCircle,
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
import { RichTextEditor } from "@/components/rich-text-editor";
import { historyStorage, HistoryItem } from "@/lib/history-storage";
import { ScrollArea } from "@/components/ui/scroll-area";

// 根据模板内容生成示例提示
function getExamplePrompts(templateId: number, templateTitle: string) {
  // 职场办公 - 沟通协作
  if (templateId >= 1001 && templateId < 1100) {
    return [
      {
        id: 1,
        text: "我需要给团队发送一封关于下周项目启动会议的通知邮件，请帮我撰写。",
      },
      {
        id: 2,
        text: "请帮我整理今天产品评审会议的会议纪要，包括讨论的关键点和决议事项。",
      },
      {
        id: 3,
        text: "我即将离职，需要准备工作交接文档，涉及3个主要项目的移交。",
      },
    ];
  }
  // 职场办公 - 汇报总结
  else if (templateId >= 1100 && templateId < 1200) {
    return [
      {
        id: 1,
        text: "我需要撰写本周工作总结，主要完成了用户系统优化和两个Bug修复。",
      },
      {
        id: 2,
        text: "请帮我写一份月度工作总结，本月主要负责了产品改版项目。",
      },
      {
        id: 3,
        text: "我需要准备季度述职报告，汇报我在产品经理岗位上的工作成果。",
      },
    ];
  }
  // 职场办公 - 演讲发言
  else if (templateId >= 1200 && templateId < 1300) {
    return [
      {
        id: 1,
        text: "我需要在公司年会上发表获奖感言，获得了最佳员工奖。",
      },
      {
        id: 2,
        text: "请帮我准备竞聘演讲稿，我要竞聘技术主管职位。",
      },
      {
        id: 3,
        text: "我要在新产品发布会上做开幕致辞，产品名称是智能办公助手。",
      },
    ];
  }
  // 职场办公 - 团队管理
  else if (templateId >= 1300 && templateId < 1400) {
    return [
      {
        id: 1,
        text: "我需要制定团队Q2的绩效考核方案，团队有8名成员。",
      },
      {
        id: 2,
        text: "请帮我设计一套新人培养计划，帮助应届生快速成长。",
      },
      {
        id: 3,
        text: "我想策划一次团建活动，增进15人团队的凝聚力。",
      },
    ];
  }
  // 职场办公 - 项目管理
  else if (templateId >= 1400 && templateId < 1500) {
    return [
      {
        id: 1,
        text: "我需要撰写APP改版项目的项目计划书，周期3个月，团队5人。",
      },
      {
        id: 2,
        text: "请帮我编写项目进度报告，目前完成了需求分析和UI设计阶段。",
      },
      {
        id: 3,
        text: "我需要制定项目风险管理方案，识别技术和资源方面的潜在风险。",
      },
    ];
  }
  // 职场办公 - 个人发展
  else if (templateId >= 1500 && templateId < 1600) {
    return [
      {
        id: 1,
        text: "我是一名产品经理，想要制定未来3年的职业发展规划。",
      },
      {
        id: 2,
        text: "请帮我优化简历，我有5年前端开发经验，想要应聘高级前端职位。",
      },
      {
        id: 3,
        text: "我想转行做数据分析师，请帮我规划学习路径和技能提升计划。",
      },
    ];
  }
  // 政务公文 - 政务公文
  else if (templateId >= 2000 && templateId < 2100) {
    return [
      {
        id: 1,
        text: "需要发布关于加强疫情防控工作的通知，面向全市各区县。",
      },
      {
        id: 2,
        text: "请帮我撰写向上级汇报的城市建设工作报告，涵盖基础设施和民生项目。",
      },
      {
        id: 3,
        text: "我需要向上级请示关于增加教育经费预算的事项。",
      },
    ];
  }
  // 政务公文 - 事务公文
  else if (templateId >= 2100 && templateId < 2200) {
    return [
      {
        id: 1,
        text: "需要发布下周一全体干部会议通知，讨论年度工作计划。",
      },
      {
        id: 2,
        text: "请帮我撰写本季度工作总结，包括完成的重点项目和存在问题。",
      },
      {
        id: 3,
        text: "我需要编写关于基层调研情况的调查报告。",
      },
    ];
  }
  // 政务公文 - 宣传公文
  else if (templateId >= 2200 && templateId < 2300) {
    return [
      {
        id: 1,
        text: "需要撰写关于我市成功举办创业创新大赛的新闻稿。",
      },
      {
        id: 2,
        text: "请帮我编写政府工作简报，汇报本周重点工作动态。",
      },
      {
        id: 3,
        text: "我需要总结推广我区扶贫工作的先进经验材料。",
      },
    ];
  }
  // 政务公文 - 通信公文
  else if (templateId >= 2300 && templateId < 2400) {
    return [
      {
        id: 1,
        text: "需要向兄弟单位发函，商洽联合开展环保专项行动事宜。",
      },
      {
        id: 2,
        text: "请帮我撰写邀请函，邀请各单位参加城市发展论坛。",
      },
      {
        id: 3,
        text: "我需要与其他部门协商关于共享数据资源的函件。",
      },
    ];
  }
  // 政务公文 - 礼仪公文
  else if (templateId >= 2400) {
    return [
      {
        id: 1,
        text: "需要撰写贺信,祝贺友好城市建市50周年。",
      },
      {
        id: 2,
        text: "请帮我准备欢迎词，欢迎上级领导来我市考察指导。",
      },
      {
        id: 3,
        text: "我需要写一封感谢信，感谢社会各界对我市防汛工作的支持。",
      },
    ];
  }

  // 默认示例
  return [
    {
      id: 1,
      text: `请帮我生成关于"${templateTitle}"的内容，包含详细的说明和实用建议。`,
    },
    {
      id: 2,
      text: `我需要一份"${templateTitle}"的模板，请提供具体的框架和要点。`,
    },
    {
      id: 3,
      text: `帮我撰写"${templateTitle}"，要求专业规范，符合行业标准。`,
    },
  ];
}

export function GeneralWritingDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateTitle = searchParams.get("title") || "通用写作";
  const templateId = searchParams.get("template") || "1001";

  const [contentInput, setContentInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("fast");
  const [resultTab, setResultTab] = useState<"current" | "history">("current");

  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyData = await historyStorage.getHistory(templateId);
        setHistory(historyData);
      } catch (error) {
        console.error("加载历史记录失败:", error);
      }
    };

    loadHistory();
  }, [templateId]);

  // 获取当前模板的示例提示
  const examplePrompts = getExamplePrompts(
    parseInt(templateId),
    templateTitle
  );

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
      const response = await fetch("/api/general-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentInput,
          templateId: templateId,
          templateTitle: templateTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setCurrentResult(data.result);

      // 添加到历史记录
      try {
        const newHistoryItem = await historyStorage.addHistory(
          templateId,
          templateTitle,
          contentInput,
          data.result
        );
        setHistory((prev) => [newHistoryItem, ...prev]);
      } catch (historyError) {
        console.error("保存历史记录失败:", historyError);
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
      console.error("删除历史记录失败:", error);
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

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Center - Form Area */}
      <div className="w-[60%] flex flex-col overflow-hidden">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/?category=general")}
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
              onClick={() => handleExampleClick(examplePrompts[0].text)}
            >
              插入示例
            </Button>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              {templateTitle}撰写专业，清晰的商务邮件，确保信息准确传达。请告诉我你想要聚焦的主题或需求，让我们开始创作吧！
            </p>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              您可以试试这样提问：
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
                描述内容
              </label>
              <Textarea
                placeholder="请输入您想要创作的内容描述..."
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
                  AI正在为您创作内容...
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
                            title: templateTitle,
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
