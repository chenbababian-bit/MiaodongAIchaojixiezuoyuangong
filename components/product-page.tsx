"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// 导入产品模板数据
import {
  productUserResearchPlanningTemplates,
  productUserResearchDesignTemplates,
  productUserResearchRecruitmentTemplates,
  productUserResearchDataCollectionTemplates,
  productUserResearchExecutionTemplates,
  productUserResearchDataAnalysisTemplates,
  productUserResearchReportingTemplates,
  productUserResearchFollowUpTemplates,
  productUserResearchLearningTemplates,
} from "@/lib/product-templates";

// 产品模块的第二层分类配置
const productSubCategories = [
  { id: "user-research", label: "用户研究" },
  { id: "product-planning", label: "产品策划" },
  { id: "game-planning", label: "游戏策划" },
];

export function ProductPage() {
  const router = useRouter();
  const [activeSecondLevel, setActiveSecondLevel] = useState("user-research");
  const [activeThirdLevel, setActiveThirdLevel] = useState("user-research-planning");

  const handleTemplateClick = (templateId: number, templateTitle: string) => {
    // 根据当前激活的分类构建source参数
    const source = `product-${activeSecondLevel}-${activeThirdLevel}`;

    console.log("点击了模板卡片，ID:", templateId);

    // 跳转到通用写作页面
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

  // 用户研究下的所有子分类配置
  const userResearchCategories = [
    { id: "user-research-planning", label: "用研规划", templates: productUserResearchPlanningTemplates },
    { id: "user-research-design", label: "研究设计", templates: productUserResearchDesignTemplates },
    { id: "user-research-recruitment", label: "招募筛选", templates: productUserResearchRecruitmentTemplates },
    { id: "user-research-data-collection", label: "数据收集", templates: productUserResearchDataCollectionTemplates },
    { id: "user-research-execution", label: "执行管理", templates: productUserResearchExecutionTemplates },
    { id: "user-research-data-analysis", label: "数据分析", templates: productUserResearchDataAnalysisTemplates },
    { id: "user-research-reporting", label: "报告呈现", templates: productUserResearchReportingTemplates },
    { id: "user-research-follow-up", label: "后续行动", templates: productUserResearchFollowUpTemplates },
    { id: "user-research-learning", label: "学习改进", templates: productUserResearchLearningTemplates },
  ];

  // 产品策划下的所有子分类配置（待填充）
  const productPlanningCategories = [
    { id: "product-planning-1", label: "待填充", templates: [] },
  ];

  // 游戏策划下的所有子分类配置（待填充）
  const gamePlanningCategories = [
    { id: "game-planning-1", label: "待填充", templates: [] },
  ];

  // 获取当前第二层分类的标题
  const getCurrentSecondLevelTitle = () => {
    const category = productSubCategories.find((cat) => cat.id === activeSecondLevel);
    return category?.label || "用户研究";
  };

  // 根据分类ID获取对应的分类配置
  const getCategoriesById = (categoryId: string) => {
    switch (categoryId) {
      case "user-research":
        return userResearchCategories;
      case "product-planning":
        return productPlanningCategories;
      case "game-planning":
        return gamePlanningCategories;
      default:
        return [];
    }
  };

  // 获取当前激活的分类配置
  const getCurrentCategories = () => {
    return getCategoriesById(activeSecondLevel);
  };

  const currentCategories = getCurrentCategories();

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* 第二层导航 - 横向标签页 */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center px-6 h-14">
          {productSubCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveSecondLevel(category.id);
                // 切换分类时，默认选中第一个子分类
                const categories = getCategoriesById(category.id);
                if (categories.length > 0) {
                  setActiveThirdLevel(categories[0].id);
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
        <div className="w-64 border-r border-border bg-card overflow-y-auto">
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">产品/</p>
            <p className="text-sm font-medium text-foreground">{getCurrentSecondLevelTitle()}</p>
          </div>
          <nav className="px-2 pb-4">
            {currentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors mb-1",
                  activeThirdLevel === category.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{category.label}</span>
                <span className="text-xs text-muted-foreground">{category.templates.length}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content - 模板卡片 */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentCategories.map((category) => (
            <div
              key={category.id}
              id={`category-${category.id}`}
              className="mb-10 scroll-mt-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">{category.label}</h2>
              {category.templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.templates.map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleTemplateClick(template.id, template.title)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", template.color)}>
                          <span className="text-lg">{template.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground truncate">{template.title}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{template.desc}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>暂无模板数据</p>
                  <p className="text-sm mt-1">请等待内容填充</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}