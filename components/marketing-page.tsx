"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  marketingSecondLevelCategories,
  brandSubCategories,
  brandStrategyTemplates,
  marketAnalysisTemplates,
  creativeContentTemplates,
  brandVisualTemplates,
  mediaPlanningTemplates,
  brandMaintenanceTemplates,
  internalTrainingTemplates,
  reportSummaryTemplates,
  innovationPlanningTemplates,
  legalComplianceTemplates,
  creativeTemplates,
  mediaTemplates,
  activityTemplates,
  researchTemplates,
  prTemplates,
  trafficTemplates,
  gameTemplates,
  b2bManagementTemplates,
  b2bDigitalTemplates,
  b2bContentTemplates,
  b2bActivityTemplates,
} from "@/lib/marketing-templates";

export function MarketingPage() {
  const router = useRouter();
  const [activeSecondLevel, setActiveSecondLevel] = useState("brand");
  const [activeThirdLevel, setActiveThirdLevel] = useState("brand-strategy");

  const handleTemplateClick = (templateId: number, templateTitle: string) => {
    // 根据当前激活的分类构建source参数
    let source = "";
    if (activeSecondLevel === "brand") {
      source = `marketing-brand-${activeThirdLevel}`;
    } else {
      source = `marketing-${activeSecondLevel}`;
    }

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

  // 品牌下的所有子分类配置
  const brandCategories = [
    { id: "brand-strategy", label: "品牌战略", templates: brandStrategyTemplates },
    { id: "market-analysis", label: "市场分析", templates: marketAnalysisTemplates },
    { id: "creative-content", label: "创意内容", templates: creativeContentTemplates },
    { id: "brand-visual", label: "品牌视觉", templates: brandVisualTemplates },
    { id: "media-planning", label: "媒介规划", templates: mediaPlanningTemplates },
    { id: "brand-maintenance", label: "品牌维护", templates: brandMaintenanceTemplates },
    { id: "internal-training", label: "内部培训", templates: internalTrainingTemplates },
    { id: "report-summary", label: "报告总结", templates: reportSummaryTemplates },
    { id: "innovation-planning", label: "创新规划", templates: innovationPlanningTemplates },
    { id: "legal-compliance", label: "法律合规", templates: legalComplianceTemplates },
  ];

  // 其他第二层分类的模板配置
  const otherCategories: { [key: string]: any[] } = {
    creative: creativeTemplates,
    media: mediaTemplates,
    activity: activityTemplates,
    research: researchTemplates,
    pr: prTemplates,
    traffic: trafficTemplates,
    game: gameTemplates,
    "b2b-management": b2bManagementTemplates,
    "b2b-digital": b2bDigitalTemplates,
    "b2b-content": b2bContentTemplates,
    "b2b-activity": b2bActivityTemplates,
  };

  // 获取当前第二层分类的标题
  const getCurrentSecondLevelTitle = () => {
    const category = marketingSecondLevelCategories.find((cat) => cat.id === activeSecondLevel);
    return category?.label || "品牌";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* 第二层导航 - 横向标签页 */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center px-6 h-14">
          {marketingSecondLevelCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveSecondLevel(category.id);
                // 如果切换到品牌,默认选中品牌战略
                if (category.id === "brand") {
                  setActiveThirdLevel("brand-strategy");
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
            {/* 第三层：品牌下的子分类 */}
            {activeSecondLevel === "brand" && (
              <div className="space-y-1">
                {brandSubCategories.map((category) => (
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
          </div>
        </div>

        {/* Main Content - 右侧内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">{getCurrentSecondLevelTitle()}</h1>

        {/* 根据选中的第二层显示不同的内容 */}
        {activeSecondLevel === "brand" && (
          /* 品牌：按子分类分组显示所有功能 */
          <div className="space-y-8">
            {brandCategories.map((category) => (
              <div key={category.id} id={`category-${category.id}`}>
                {/* 分类标题 */}
                <h2 className="text-xl font-semibold mb-4">{category.label}</h2>

                {/* 功能卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleTemplateClick(template.id, template.title)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                            template.color
                          )}
                        >
                          {template.icon}
                        </div>
                        <h3 className="font-medium text-sm flex-1">{template.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.desc}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 其他分类内容 */}
        {activeSecondLevel !== "brand" && otherCategories[activeSecondLevel] && (
          <div className="space-y-8">
            <div>
              {/* 功能卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {otherCategories[activeSecondLevel].map((template) => (
                  <Card
                    key={template.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleTemplateClick(template.id, template.title)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0",
                          template.color
                        )}
                      >
                        {template.icon}
                      </div>
                      <h3 className="font-medium text-sm flex-1">{template.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

