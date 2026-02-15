"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  marketingSecondLevelCategories,
  brandSubCategories,
  creativeSubCategories,
  mediaSubCategories,
  activitySubCategories,
  researchSubCategories,
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
  creativeStrategyTemplates,
  designVisualTemplates,
  creativeDevelopmentTemplates,
  projectManagementTemplates,
  trainingDevelopmentTemplates,
  performanceEvaluationTemplates,
  marketResearchTemplates,
  innovationTrendsTemplates,
  customerRelationsTemplates,
  financialBudgetTemplates,
  legalComplianceCreativeTemplates,
  technicalToolsTemplates,
  mediaStrategyTemplates,
  adPlacementTemplates,
  digitalMediaTemplates,
  mediaRelationsTemplates,
  projectManagementMediaTemplates,
  clientCommunicationTemplates,
  mediaMonitoringTemplates,
  reportSummaryMediaTemplates,
  processManagementTemplates,
  teamBuildingTemplates,
  internalProcessTemplates,
  legalComplianceMediaTemplates,
  techInnovationTemplates,
  projectManagementActivityTemplates,
  technicalEquipmentTemplates,
  legalComplianceActivityTemplates,
  eventClosingTemplates,
  teamBuildingActivityTemplates,
  budgetFinanceActivityTemplates,
  internalProcessActivityTemplates,
  clientCommunicationActivityTemplates,
  eventMonitoringActivityTemplates,
  eventPlanningActivityTemplates,
  partnershipManagementActivityTemplates,
  venueSetupActivityTemplates,
  guestSpeakerActivityTemplates,
  registrationManagementActivityTemplates,
  eventExecutionActivityTemplates,
  eventProgramActivityTemplates,
  marketingPromotionActivityTemplates,
  creativeDesignActivityTemplates,
  researchStrategyTemplates,
  designExecutionTemplates,
  dataAnalysisTemplates,
  marketAnalysisResearchTemplates,
  researchResultsTemplates,
  effectEvaluationTemplates,
  projectManagementResearchTemplates,
  trainingEducationTemplates,
  legalComplianceResearchTemplates,
  technicalToolsTemplates as technicalToolsResearchTemplates,
  activityTemplates,
  researchTemplates,
  prTemplates,
  trafficTemplates,
  gameTemplates,
  b2bManagementTemplates,
  b2bDigitalTemplates,
  b2bContentTemplates,
  b2bActivityTemplates,
  prSubCategories,
  prStrategyTemplates,
  prPlanningTemplates,
  mediaRelationsPrTemplates,
  socialMediaManagementTemplates,
  eventActivitiesTemplates,
  crisisManagementTemplates,
  eventPlanningPrTemplates,
  internalCommunicationTemplates,
  partnershipTemplates,
  monitoringEvaluationTemplates,
  reportPresentationTemplates,
  trainingDevelopmentPrTemplates,
  financeBudgetPrTemplates,
  legalCompliancePrTemplates,
  innovationTechnologyTemplates,
  trafficSubCategories,
  placementStrategyTemplates,
  creativeMaterialsTemplates,
  accountManagementTemplates,
  placementMonitoringTemplates,
  dataAnalysisTrafficTemplates,
  technicalSupportTemplates,
  teamCollaborationTemplates,
  legalComplianceTrafficTemplates,
  gameSubCategories,
  promotionPlanningTemplates,
  contentCreationTemplates,
  activityPlanningTemplates,
  adPlacementGameTemplates,
  partnershipGameTemplates,
  dataAnalysisGameTemplates,
  internalCollaborationTemplates,
  legalComplianceGameTemplates,
  b2bManagementSubCategories,
  strategicPlanningTemplates,
  marketResearchB2BTemplates,
  brandCommunicationTemplates,
  marketingActivitiesTemplates,
  productMarketingTemplates,
  salesSupportTemplates,
  dataAnalysisB2BTemplates,
  partnershipB2BTemplates,
  teamManagementB2BTemplates,
  legalComplianceB2BTemplates,
  technicalToolsB2BTemplates,
  improvementInnovationTemplates,
  b2bDigitalSubCategories,
  strategicPlanningDigitalTemplates,
  websiteSeoTemplates,
  advertisingPpcTemplates,
  socialMediaMarketingTemplates,
  emailMarketingTemplates,
  dataAnalysisDigitalTemplates,
  customerRelationshipTemplates,
  technicalToolsDigitalTemplates,
  teamCollaborationDigitalTemplates,
  b2bContentSubCategories,
  contentStrategyTemplates,
  marketResearchContentTemplates,
  contentCreationContentTemplates,
  caseStudyTemplates,
  emailMarketingContentTemplates,
  socialMediaManagementContentTemplates,
  websiteSeoContentTemplates,
  contentDistributionTemplates,
  eventsConferencesTemplates,
  analyticsReportsTemplates,
  projectManagementContentTemplates,
  trainingDevelopmentContentTemplates,
  legalComplianceContentTemplates,
  financialBudgetContentTemplates,
  innovationExperimentsTemplates,
  b2bActivitySubCategories,
  eventPlanningB2bTemplates,
  marketingMaterialsTemplates,
  participantManagementTemplates,
  techPlatformTemplates,
  marketingCommunicationTemplates,
  dataAnalysisActivityTemplates,
  followUpActionsTemplates,
  legalComplianceB2bActivityTemplates,
  departmentCollaborationTemplates,
  learningDevelopmentTemplates,
} from "@/lib/marketing-templates";

export function MarketingPage() {
  const router = useRouter();
  const [activeSecondLevel, setActiveSecondLevel] = useState("brand");
  const [activeThirdLevel, setActiveThirdLevel] = useState("brand-strategy");

  const handleTemplateClick = (templateId: number, templateTitle: string) => {
    // 检测是否为品牌战略模块（10001-10015），直接跳转到对话式界面
    if (templateId >= 10001 && templateId <= 10015) {
      router.push(
        `/marketing/brand-strategy?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=marketing-brand-brand-strategy`
      );
      return;
    }

    // 检测是否为创意策略模块（11001-11014），直接跳转到对话式界面
    if (templateId >= 11001 && templateId <= 11014) {
      router.push(
        `/writing/creative-strategy?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=marketing-creative-creative-strategy`
      );
      return;
    }

    // 检测是否为媒介模块（13001-13016），直接跳转到对话式界面
    if (templateId >= 13001 && templateId <= 13016) {
      router.push(
        `/writing/media?template=${templateId}&title=${encodeURIComponent(templateTitle)}&source=marketing-media-media-strategy`
      );
      return;
    }

    // 根据当前激活的分类构建source参数
    let source = "";
    if (activeSecondLevel === "brand") {
      source = `marketing-brand-${activeThirdLevel}`;
    } else if (activeSecondLevel === "creative") {
      source = `marketing-creative-${activeThirdLevel}`;
    } else if (activeSecondLevel === "media") {
      source = `marketing-media-${activeThirdLevel}`;
    } else if (activeSecondLevel === "activity") {
      source = `marketing-activity-${activeThirdLevel}`;
    } else if (activeSecondLevel === "research") {
      source = `marketing-research-${activeThirdLevel}`;
    } else if (activeSecondLevel === "pr") {
      source = `marketing-pr-${activeThirdLevel}`;
    } else if (activeSecondLevel === "traffic") {
      source = `marketing-traffic-${activeThirdLevel}`;
    } else if (activeSecondLevel === "game") {
      source = `marketing-game-${activeThirdLevel}`;
    } else if (activeSecondLevel === "b2b-management") {
      source = `marketing-b2b-management-${activeThirdLevel}`;
    } else if (activeSecondLevel === "b2b-digital") {
      source = `marketing-b2b-digital-${activeThirdLevel}`;
    } else if (activeSecondLevel === "b2b-content") {
      source = `marketing-b2b-content-${activeThirdLevel}`;
    } else if (activeSecondLevel === "b2b-activity") {
      source = `marketing-b2b-activity-${activeThirdLevel}`;
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

  // 创意下的所有子分类配置
  const creativeCategories = [
    { id: "creative-strategy", label: "创意策略", templates: creativeStrategyTemplates },
    { id: "design-visual", label: "设计视觉", templates: designVisualTemplates },
    { id: "creative-development", label: "创意开发", templates: creativeDevelopmentTemplates },
    { id: "project-management", label: "项目管理", templates: projectManagementTemplates },
    { id: "training-development", label: "培训发展", templates: trainingDevelopmentTemplates },
    { id: "performance-evaluation", label: "绩效评估", templates: performanceEvaluationTemplates },
    { id: "market-research", label: "市场调研", templates: marketResearchTemplates },
    { id: "innovation-trends", label: "创新趋势", templates: innovationTrendsTemplates },
    { id: "customer-relations", label: "客户关系", templates: customerRelationsTemplates },
    { id: "financial-budget", label: "财务预算", templates: financialBudgetTemplates },
    { id: "legal-compliance-creative", label: "法律合规", templates: legalComplianceCreativeTemplates },
    { id: "technical-tools", label: "技术工具", templates: technicalToolsTemplates },
  ];

  // 媒介下的所有子分类配置
  const mediaCategories = [
    { id: "media-strategy", label: "媒体策略", templates: mediaStrategyTemplates },
    { id: "ad-placement", label: "广告投放", templates: adPlacementTemplates },
    { id: "digital-media", label: "数字媒体", templates: digitalMediaTemplates },
    { id: "media-relations", label: "媒体关系", templates: mediaRelationsTemplates },
    { id: "project-management-media", label: "项目管理", templates: projectManagementMediaTemplates },
    { id: "client-communication", label: "客户沟通", templates: clientCommunicationTemplates },
    { id: "media-monitoring", label: "媒体监测", templates: mediaMonitoringTemplates },
    { id: "report-summary-media", label: "报告总结", templates: reportSummaryMediaTemplates },
    { id: "process-management", label: "流程管理", templates: processManagementTemplates },
    { id: "team-building", label: "团队建设", templates: teamBuildingTemplates },
    { id: "internal-process", label: "内部流程", templates: internalProcessTemplates },
    { id: "legal-compliance-media", label: "法律合规", templates: legalComplianceMediaTemplates },
    { id: "tech-innovation", label: "技术创新", templates: techInnovationTemplates },
  ];

  // 活动策划下的所有子分类配置
  const activityCategories = [
    { id: "project-management-activity", label: "项目管理", templates: projectManagementActivityTemplates },
    { id: "technical-equipment", label: "技术设备", templates: technicalEquipmentTemplates },
    { id: "legal-compliance-activity", label: "法律合规", templates: legalComplianceActivityTemplates },
    { id: "event-closing", label: "活动收尾", templates: eventClosingTemplates },
    { id: "team-building-activity", label: "团队建设", templates: teamBuildingActivityTemplates },
    { id: "budget-finance", label: "预算财务", templates: budgetFinanceActivityTemplates },
    { id: "internal-process-activity", label: "内部流程", templates: internalProcessActivityTemplates },
    { id: "client-communication-activity", label: "客户沟通", templates: clientCommunicationActivityTemplates },
    { id: "event-monitoring", label: "活动监测", templates: eventMonitoringActivityTemplates },
    { id: "event-planning", label: "活动策划", templates: eventPlanningActivityTemplates },
    { id: "partnership-management", label: "合作管理", templates: partnershipManagementActivityTemplates },
    { id: "venue-setup", label: "场地布置", templates: venueSetupActivityTemplates },
    { id: "guest-speaker", label: "嘉宾演讲", templates: guestSpeakerActivityTemplates },
    { id: "registration-management", label: "报名管理", templates: registrationManagementActivityTemplates },
    { id: "event-execution", label: "活动执行", templates: eventExecutionActivityTemplates },
    { id: "event-program", label: "活动程序", templates: eventProgramActivityTemplates },
    { id: "market-promotion", label: "市场宣传", templates: marketingPromotionActivityTemplates },
    { id: "creative-design-activity", label: "创意设计", templates: creativeDesignActivityTemplates },
  ];

  // 调研下的所有子分类配置
  const researchCategories = [
    { id: "research-strategy", label: "调研策略", templates: researchStrategyTemplates },
    { id: "design-execution", label: "设计执行", templates: designExecutionTemplates },
    { id: "data-analysis", label: "数据分析", templates: dataAnalysisTemplates },
    { id: "market-analysis-research", label: "市场分析", templates: marketAnalysisResearchTemplates },
    { id: "research-results", label: "调研结果", templates: researchResultsTemplates },
    { id: "effect-evaluation", label: "效果评估", templates: effectEvaluationTemplates },
    { id: "project-management-research", label: "项目管理", templates: projectManagementResearchTemplates },
    { id: "training-education", label: "培训教育", templates: trainingEducationTemplates },
    { id: "legal-compliance-research", label: "法律合规", templates: legalComplianceResearchTemplates },
    { id: "technical-tools", label: "技术工具", templates: technicalToolsResearchTemplates },
  ];

  // 公关传播下的所有子分类配置
  const prCategories = [
    { id: "pr-strategy", label: "公关战略", templates: prStrategyTemplates },
    { id: "pr-planning", label: "公关策划", templates: prPlanningTemplates },
    { id: "media-relations-pr", label: "媒体关系", templates: mediaRelationsPrTemplates },
    { id: "social-media-management", label: "社媒管理", templates: socialMediaManagementTemplates },
    { id: "event-activities", label: "活动事件", templates: eventActivitiesTemplates },
    { id: "crisis-management", label: "危机管理", templates: crisisManagementTemplates },
    { id: "event-planning-pr", label: "事件策划", templates: eventPlanningPrTemplates },
    { id: "internal-communication", label: "内部沟通", templates: internalCommunicationTemplates },
    { id: "partnership", label: "合作伙伴", templates: partnershipTemplates },
    { id: "monitoring-evaluation", label: "监测评估", templates: monitoringEvaluationTemplates },
    { id: "report-presentation", label: "报告呈现", templates: reportPresentationTemplates },
    { id: "training-development-pr", label: "培训与发展", templates: trainingDevelopmentPrTemplates },
    { id: "finance-budget-pr", label: "财务与预算", templates: financeBudgetPrTemplates },
    { id: "legal-compliance-pr", label: "法律合规", templates: legalCompliancePrTemplates },
    { id: "innovation-technology", label: "创新与技术", templates: innovationTechnologyTemplates },
  ];

  const trafficCategories = [
    { id: "placement-strategy", label: "投放策略", templates: placementStrategyTemplates },
    { id: "creative-materials", label: "创意素材", templates: creativeMaterialsTemplates },
    { id: "account-management", label: "账户管理", templates: accountManagementTemplates },
    { id: "placement-monitoring", label: "投放监测", templates: placementMonitoringTemplates },
    { id: "data-analysis-traffic", label: "数据分析", templates: dataAnalysisTrafficTemplates },
    { id: "technical-support", label: "技术支持", templates: technicalSupportTemplates },
    { id: "team-collaboration", label: "团队协作", templates: teamCollaborationTemplates },
    { id: "legal-compliance-traffic", label: "法律合规", templates: legalComplianceTrafficTemplates },
  ];

  const gameCategories = [
    { id: "promotion-planning", label: "推广规划", templates: promotionPlanningTemplates },
    { id: "content-creation", label: "内容创作", templates: contentCreationTemplates },
    { id: "activity-planning", label: "活动策划", templates: activityPlanningTemplates },
    { id: "ad-placement-game", label: "广告投放", templates: adPlacementGameTemplates },
    { id: "partnership-game", label: "合作关系", templates: partnershipGameTemplates },
    { id: "data-analysis-game", label: "数据分析", templates: dataAnalysisGameTemplates },
    { id: "internal-collaboration", label: "内部协作", templates: internalCollaborationTemplates },
    { id: "legal-compliance-game", label: "法律合规", templates: legalComplianceGameTemplates },
  ];

  // B2B营销管理分类配置
  const b2bManagementCategories = [
    { id: "strategic-planning", label: "战略规划", templates: strategicPlanningTemplates },
    { id: "market-research-b2b", label: "市场调研", templates: marketResearchB2BTemplates },
    { id: "brand-communication", label: "品牌传播", templates: brandCommunicationTemplates },
    { id: "marketing-activities", label: "营销活动", templates: marketingActivitiesTemplates },
    { id: "product-marketing", label: "产品营销", templates: productMarketingTemplates },
    { id: "sales-support", label: "销售支持", templates: salesSupportTemplates },
    { id: "data-analysis-b2b", label: "数据分析", templates: dataAnalysisB2BTemplates },
    { id: "partnership", label: "合作关系", templates: partnershipB2BTemplates },
    { id: "team-management-b2b", label: "团队管理", templates: teamManagementB2BTemplates },
    { id: "legal-compliance-b2b", label: "法律合规", templates: legalComplianceB2BTemplates },
    { id: "technical-tools-b2b", label: "技术工具", templates: technicalToolsB2BTemplates },
    { id: "improvement-innovation", label: "改进创新", templates: improvementInnovationTemplates },
  ];

  // B2B数字营销下的所有子分类配置
  const b2bDigitalCategories = [
    { id: "strategic-planning-digital", label: "战略规划", templates: strategicPlanningDigitalTemplates },
    { id: "website-seo", label: "网站SEO", templates: websiteSeoTemplates },
    { id: "advertising-ppc", label: "广告PPC", templates: advertisingPpcTemplates },
    { id: "social-media-marketing", label: "社媒营销", templates: socialMediaMarketingTemplates },
    { id: "email-marketing", label: "邮件营销", templates: emailMarketingTemplates },
    { id: "data-analysis-digital", label: "数据分析", templates: dataAnalysisDigitalTemplates },
    { id: "customer-relationship", label: "客户关系", templates: customerRelationshipTemplates },
    { id: "technical-tools-digital", label: "技术工具", templates: technicalToolsDigitalTemplates },
    { id: "team-collaboration", label: "团队协作", templates: teamCollaborationDigitalTemplates },
  ];

  // B2B内容营销下的所有子分类配置
  const b2bContentCategories = [
    { id: "content-strategy", label: "内容策略", templates: contentStrategyTemplates },
    { id: "market-research-content", label: "市场研究", templates: marketResearchContentTemplates },
    { id: "content-creation", label: "内容创作", templates: contentCreationContentTemplates },
    { id: "case-study", label: "案例研究", templates: caseStudyTemplates },
    { id: "email-marketing", label: "邮件营销", templates: emailMarketingContentTemplates },
    { id: "social-media-management", label: "社媒管理", templates: socialMediaManagementContentTemplates },
    { id: "website-seo", label: "网站SEO", templates: websiteSeoContentTemplates },
    { id: "content-distribution", label: "内容分发", templates: contentDistributionTemplates },
    { id: "events-conferences", label: "活动会议", templates: eventsConferencesTemplates },
    { id: "analytics-reports", label: "分析报告", templates: analyticsReportsTemplates },
    { id: "project-management-content", label: "项目管理", templates: projectManagementContentTemplates },
    { id: "training-development-content", label: "培训发展", templates: trainingDevelopmentContentTemplates },
    { id: "legal-compliance-content", label: "法律合规", templates: legalComplianceContentTemplates },
    { id: "financial-budget-content", label: "财务预算", templates: financialBudgetContentTemplates },
    { id: "innovation-experiments", label: "创新实验", templates: innovationExperimentsTemplates },
  ];

  // B2B活动营销下的所有子分类配置
  const b2bActivityCategories = [
    { id: "event-planning-b2b", label: "活动策划", templates: eventPlanningB2bTemplates },
    { id: "marketing-materials", label: "营销物料", templates: marketingMaterialsTemplates },
    { id: "participant-management", label: "参与者管理", templates: participantManagementTemplates },
    { id: "tech-platform", label: "技术平台", templates: techPlatformTemplates },
    { id: "marketing-communication", label: "营销传播", templates: marketingCommunicationTemplates },
    { id: "data-analysis-activity", label: "数据分析", templates: dataAnalysisActivityTemplates },
    { id: "follow-up-actions", label: "后续行动", templates: followUpActionsTemplates },
    { id: "legal-compliance-activity", label: "法律合规", templates: legalComplianceB2bActivityTemplates },
    { id: "department-collaboration", label: "部门协作", templates: departmentCollaborationTemplates },
    { id: "learning-development", label: "学习发展", templates: learningDevelopmentTemplates },
  ];

  // 其他第二层分类的模板配置
  const otherCategories: { [key: string]: any[] } = {
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
                // 如果切换到创意,默认选中创意策略
                if (category.id === "creative") {
                  setActiveThirdLevel("creative-strategy");
                }
                // 如果切换到媒介,默认选中媒体策略
                if (category.id === "media") {
                  setActiveThirdLevel("media-strategy");
                }
                // 如果切换到活动策划,默认选中项目管理
                if (category.id === "activity") {
                  setActiveThirdLevel("project-management-activity");
                }
                // 如果切换到B2B营销管理,默认选中战略规划
                if (category.id === "b2b-management") {
                  setActiveThirdLevel("strategic-planning");
                }
                // 如果切换到B2B活动营销,默认选中活动策划
                if (category.id === "b2b-activity") {
                  setActiveThirdLevel("event-planning-b2b");
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

            {/* 第三层：创意下的子分类 */}
            {activeSecondLevel === "creative" && (
              <div className="space-y-1">
                {creativeSubCategories.map((category) => (
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

            {/* 第三层：媒介下的子分类 */}
            {activeSecondLevel === "media" && (
              <div className="space-y-1">
                {mediaSubCategories.map((category) => (
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

            {/* 第三层：活动策划下的子分类 */}
            {activeSecondLevel === "activity" && (
              <div className="space-y-1">
                {activitySubCategories.map((category) => (
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

            {/* 第三层：调研下的子分类 */}
            {activeSecondLevel === "research" && (
              <div className="space-y-1">
                {researchSubCategories.map((category) => (
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

            {activeSecondLevel === "pr" && (
              <div className="space-y-1">
                {prSubCategories.map((category) => (
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

            {/* 流量投放的三级导航 */}
            {activeSecondLevel === "traffic" && (
              <div className="space-y-1">
                {trafficSubCategories.map((category) => (
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

            {/* 游戏推广的三级导航 */}
            {activeSecondLevel === "game" && (
              <div className="space-y-1">
                {gameSubCategories.map((category) => (
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

            {/* B2B营销管理三级导航 */}
            {activeSecondLevel === "b2b-management" && (
              <div className="space-y-1">
                {b2bManagementSubCategories.map((category) => (
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

            {/* B2B数字营销三级导航 */}
            {activeSecondLevel === "b2b-digital" && (
              <div className="space-y-1">
                {b2bDigitalSubCategories.map((category) => (
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

            {activeSecondLevel === "b2b-content" && (
              <div className="space-y-1">
                {b2bContentSubCategories.map((category) => (
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

            {activeSecondLevel === "b2b-activity" && (
              <div className="space-y-1">
                {b2bActivitySubCategories.map((category) => (
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

        {/* 创意：按子分类分组显示所有功能 */}
        {activeSecondLevel === "creative" && (
          <div className="space-y-8">
            {creativeCategories.map((category) => (
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

        {/* 媒介：按子分类分组显示所有功能 */}
        {activeSecondLevel === "media" && (
          <div className="space-y-8">
            {mediaCategories.map((category) => (
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

        {/* 活动策划：按子分类分组显示所有功能 */}
        {activeSecondLevel === "activity" && (
          <div className="space-y-8">
            {activityCategories.map((category) => (
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

        {/* 调研：按子分类分组显示所有功能 */}
        {activeSecondLevel === "research" && (
          <div className="space-y-8">
            {researchCategories.map((category) => (
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

        {activeSecondLevel === "pr" && (
          <div className="space-y-8">
            {prCategories.map((category) => (
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

        {/* 流量投放分类内容 */}
        {activeSecondLevel === "traffic" && (
          <div className="space-y-8">
            {trafficCategories.map((category) => (
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

        {/* 游戏推广分类内容 */}
        {activeSecondLevel === "game" && (
          <div className="space-y-8">
            {gameCategories.map((category) => (
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

        {/* B2B营销管理分类内容 */}
        {activeSecondLevel === "b2b-management" && (
          <div className="space-y-8">
            {b2bManagementCategories.map((category) => (
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

        {/* B2B数字营销：按子分类分组显示所有功能 */}
        {activeSecondLevel === "b2b-digital" && (
          <div className="space-y-8">
            {b2bDigitalCategories.map((category) => (
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

        {/* B2B内容营销：按子分类分组显示所有功能 */}
        {activeSecondLevel === "b2b-content" && (
          <div className="space-y-8">
            {b2bContentCategories.map((category) => (
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

        {/* B2B活动营销：按子分类分组显示所有功能 */}
        {activeSecondLevel === "b2b-activity" && (
          <div className="space-y-8">
            {b2bActivityCategories.map((category) => (
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
        {activeSecondLevel !== "brand" && activeSecondLevel !== "creative" && activeSecondLevel !== "media" && activeSecondLevel !== "activity" && activeSecondLevel !== "research" && activeSecondLevel !== "pr" && activeSecondLevel !== "traffic" && activeSecondLevel !== "game" && activeSecondLevel !== "b2b-management" && activeSecondLevel !== "b2b-digital" && activeSecondLevel !== "b2b-content" && activeSecondLevel !== "b2b-activity" && otherCategories[activeSecondLevel] && (
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

