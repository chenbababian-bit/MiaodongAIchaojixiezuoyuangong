"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  operationSubCategories,
  growthStrategyTemplates,
  userActivationTemplates,
} from "@/lib/marketing-templates";

export function OperationPage() {
  const router = useRouter();
  const [activeSecondLevel, setActiveSecondLevel] = useState("growth-hacker");
  const [activeThirdLevel, setActiveThirdLevel] = useState("growth-strategy");

  const handleTemplateClick = (templateId: number, templateTitle: string) => {
    // 根据当前激活的分类构建source参数
    const source = `operation-${activeSecondLevel}-${activeThirdLevel}`;

    console.log("点击了模板卡片，ID:", templateId);
    router.push(`/writing/xiaohongshu?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=${source}`);
  };

  // 滚动到指定分类的位置
  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActiveThirdLevel(categoryId);
  };

  // 增长黑客下的所有子分类配置
  const growthHackerCategories = [
    { id: "growth-strategy", label: "增长策略", templates: growthStrategyTemplates },
    { id: "user-activation", label: "用户激活", templates: userActivationTemplates },
  ];

  // 获取当前第二层分类的标题
  const getCurrentSecondLevelTitle = () => {
    const category = operationSubCategories.find((cat) => cat.id === activeSecondLevel);
    return category?.label || "增长黑客";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* 第二层导航 - 横向标签页 */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center px-6 h-14">
          {operationSubCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveSecondLevel(category.id);
                // 如果切换到增长黑客,默认选中增长策略
                if (category.id === "growth-hacker") {
                  setActiveThirdLevel("growth-strategy");
                }
              }}
              className={cn(
                "px-6 h-full text-sm font-medium transition-colors relative",
                activeSecondLevel === category.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category.label}
              {activeSecondLevel === category.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - 第三层导航 */}
        <div className="w-48 border-r border-border bg-card overflow-y-auto">
          <div className="p-2">
            {/* 第三层：增长黑客下的子分类 */}
            {activeSecondLevel === "growth-hacker" && (
              <div className="space-y-1">
                {growthHackerCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => scrollToCategory(category.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1",
                      activeThirdLevel === category.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}

            {/* 其他分类暂时显示"敬请期待" */}
            {activeSecondLevel !== "growth-hacker" && (
              <div className="p-4 text-center text-muted-foreground">
                <p className="text-sm">敬请期待</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {/* 增长黑客分类的内容 */}
            {activeSecondLevel === "growth-hacker" && (
              <>
                {growthHackerCategories.map((category) => (
                  <div key={category.id} id={`category-${category.id}`} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{category.label}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {category.templates.map((template) => (
                        <Card
                          key={template.id}
                          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleTemplateClick(template.id, template.title)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0", template.color)}>
                              {template.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm mb-1 line-clamp-1">{template.title}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2">{template.desc}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 其他分类暂时显示"敬请期待" */}
            {activeSecondLevel !== "growth-hacker" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-muted-foreground mb-2">敬请期待</p>
                  <p className="text-sm text-muted-foreground">该分类内容正在开发中...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
