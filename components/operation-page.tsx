"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  operationSubCategories,
  growthStrategyTemplates,
  userActivationTemplates,
  userRetentionTemplates,
  growthUserResearchTemplates,
  optimizationIterationTemplates,
  marketingPromotionTemplates,
  growthDataAnalysisTemplates,
  technicalAutomationTemplates,
  crossDepartmentCollaborationTemplates,
  complianceLegalTemplates,
  ecommerceMarketAnalysisTemplates,
  ecommerceProductManagementTemplates,
  userResearchTemplates,
  userGrowthTemplates,
  shortVideoContentCreationTemplates,
  privateDomainUserGrowthTemplates,
  privateDomainCommunityTemplates,
  weiboOperationPlanningTemplates,
  weiboContentCreationTemplates,
  officialAccountContentPlanningTemplates,
  communityPlanningTemplates,
  customerServiceTemplates,
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
    { id: "user-retention", label: "用户留存", templates: userRetentionTemplates },
    { id: "user-research", label: "用户研究", templates: growthUserResearchTemplates },
    { id: "optimization-iteration", label: "优化迭代", templates: optimizationIterationTemplates },
    { id: "marketing-promotion", label: "营销推广", templates: marketingPromotionTemplates },
    { id: "data-analysis", label: "数据分析", templates: growthDataAnalysisTemplates },
    { id: "technical-automation", label: "技术自动化", templates: technicalAutomationTemplates },
    { id: "cross-department", label: "跨部门协作", templates: crossDepartmentCollaborationTemplates },
    { id: "compliance-legal", label: "合规法律", templates: complianceLegalTemplates },
  ];

  // 电商运营下的所有子分类配置
  const ecommerceOperationCategories = [
    { id: "market-analysis", label: "市场分析", templates: ecommerceMarketAnalysisTemplates },
    { id: "product-management", label: "商品管理", templates: ecommerceProductManagementTemplates },
  ];

  // 用户运营下的所有子分类配置
  const userOperationCategories = [
    { id: "user-research", label: "用户研究", templates: userResearchTemplates },
    { id: "user-growth", label: "用户增长", templates: userGrowthTemplates },
  ];

  // 短视频运营下的所有子分类配置
  const shortVideoOperationCategories = [
    { id: "content-creation", label: "内容创作", templates: shortVideoContentCreationTemplates },
  ];

  // 私域运营下的所有子分类配置
  const privateDomainOperationCategories = [
    { id: "user-growth-private", label: "用户增长", templates: privateDomainUserGrowthTemplates },
    { id: "community-operation", label: "社群运营", templates: privateDomainCommunityTemplates },
  ];

  // 微博运营下的所有子分类配置
  const weiboOperationCategories = [
    { id: "operation-planning", label: "运营规划", templates: weiboOperationPlanningTemplates },
    { id: "content-creation-weibo", label: "内容创作", templates: weiboContentCreationTemplates },
  ];

  // 公众号运营下的所有子分类配置
  const officialAccountOperationCategories = [
    { id: "content-planning", label: "内容策划", templates: officialAccountContentPlanningTemplates },
  ];

  // 社群运营下的所有子分类配置
  const communityOperationCategories = [
    { id: "community-planning", label: "社群策划", templates: communityPlanningTemplates },
  ];

  // 客户服务下的所有子分类配置
  const customerServiceCategories = [
    { id: "customer-service", label: "客户服务", templates: customerServiceTemplates },
  ];

  // 获取当前第二层分类的标题
  const getCurrentSecondLevelTitle = () => {
    const category = operationSubCategories.find((cat) => cat.id === activeSecondLevel);
    return category?.label || "增长黑客";
  };

  // 根据分类ID获取对应的分类配置
  const getCategoriesById = (categoryId: string) => {
    switch (categoryId) {
      case "growth-hacker":
        return growthHackerCategories;
      case "ecommerce-operation":
        return ecommerceOperationCategories;
      case "user-operation":
        return userOperationCategories;
      case "short-video-operation":
        return shortVideoOperationCategories;
      case "private-domain-operation":
        return privateDomainOperationCategories;
      case "weibo-operation":
        return weiboOperationCategories;
      case "official-account-operation":
        return officialAccountOperationCategories;
      case "community-operation":
        return communityOperationCategories;
      case "customer-service":
        return customerServiceCategories;
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
          {operationSubCategories.map((category) => (
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
        <div className="w-48 border-r border-border bg-card overflow-y-auto">
          <div className="p-2">
            {currentCategories.length > 0 && (
              <div className="space-y-1">
                {currentCategories.map((category) => (
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-6">
            {currentCategories.length > 0 && (
              <>
                {currentCategories.map((category) => (
                  <div key={category.id} id={`category-${category.id}`} className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{category.label}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {category.templates.map((template) => (
                        <Card
                          key={template.id}
                          className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => handleTemplateClick(template.id, template.title)}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0", template.color)}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
