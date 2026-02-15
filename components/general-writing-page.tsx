"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  generalWritingCategories,
  workplaceSubCategories,
  governmentSubCategories,
  communicationTemplates,
  reportsTemplates,
  speechesTemplates,
  teamManagementTemplates,
  projectManagementTemplates,
  personalDevelopmentTemplates,
  governmentAffairsTemplates,
  administrativeTemplates,
  publicityTemplates,
  communicationDocsTemplates,
  etiquetteTemplates,
} from "@/lib/general-templates";

// 模板映射 - 根据分类 ID 获取对应的模板数组
const getTemplates = (categoryId: string, subCategoryId?: string) => {
  if (categoryId === "workplace") {
    switch (subCategoryId) {
      case "communication":
        return communicationTemplates;
      case "reports":
        return reportsTemplates;
      case "speeches":
        return speechesTemplates;
      case "team-management":
        return teamManagementTemplates;
      case "project-management":
        return projectManagementTemplates;
      case "personal-development":
        return personalDevelopmentTemplates;
      default:
        return [];
    }
  } else if (categoryId === "government") {
    switch (subCategoryId) {
      case "government-affairs":
        return governmentAffairsTemplates;
      case "administrative":
        return administrativeTemplates;
      case "publicity":
        return publicityTemplates;
      case "communication-docs":
        return communicationDocsTemplates;
      case "etiquette":
        return etiquetteTemplates;
      default:
        return [];
    }
  }
  return [];
};

export function GeneralWritingPage() {
  const router = useRouter();

  // 第二层：职场办公 vs 政务公文
  const [activeSecondLevel, setActiveSecondLevel] = useState("workplace");

  // 第三层：选中的子分类
  const [activeThirdLevel, setActiveThirdLevel] = useState("communication");

  // 获取当前应该显示的第三层分类
  const currentThirdLevelCategories =
    activeSecondLevel === "workplace"
      ? workplaceSubCategories
      : governmentSubCategories;

  // 获取当前应该显示的模板（第四层）
  const currentTemplates = getTemplates(activeSecondLevel, activeThirdLevel);

  // 处理模板点击
  const handleTemplateClick = (templateId: number, title: string) => {
    // 检测是否为沟通协作模板（1001-1013），直接跳转到对话式界面
    if (templateId >= 1001 && templateId <= 1013) {
      router.push(
        `/writing/communication?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为汇报总结模板（1101-1112），跳转到汇报总结对话式界面
    else if (templateId >= 1101 && templateId <= 1112) {
      router.push(
        `/writing/report?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为演讲发言模块（1201-1212），跳转到演讲发言对话式界面
    else if (templateId >= 1201 && templateId <= 1212) {
      router.push(
        `/writing/speeches?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为创意策略模块（11001-11014），跳转到创意策略对话式界面
    else if (templateId >= 11001 && templateId <= 11014) {
      router.push(
        `/writing/creative-strategy?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为团队管理模块（1301-1316），跳转到团队管理对话式界面
    else if (templateId >= 1301 && templateId <= 1316) {
      router.push(
        `/writing/team-management?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为项目管理模块（1401-1406），跳转到项目管理对话式界面
    else if (templateId >= 1401 && templateId <= 1406) {
      router.push(
        `/writing/project-management?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为个人发展模块（1501-1519），跳转到个人发展对话式界面
    else if (templateId >= 1501 && templateId <= 1519) {
      router.push(
        `/writing/personal-development?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为政务公文模块（2001-2015），跳转到政务公文对话式界面
    else if (templateId >= 2001 && templateId <= 2015) {
      router.push(
        `/writing/government-affairs?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为事务公文模块（2101-2112），跳转到事务公文对话式界面
    else if (templateId >= 2101 && templateId <= 2112) {
      router.push(
        `/writing/administrative?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为宣传公文模块（2201-2205），跳转到宣传公文对话式界面
    else if (templateId >= 2201 && templateId <= 2205) {
      router.push(
        `/writing/publicity?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为通信公文模块（2301-2304），跳转到通信公文对话式界面
    else if (templateId >= 2301 && templateId <= 2304) {
      router.push(
        `/writing/communication-docs?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    }
    // 检测是否为礼仪公文模块（2401-2404），跳转到礼仪公文对话式界面
    else if (templateId >= 2401 && templateId <= 2404) {
      router.push(
        `/writing/etiquette?template=${templateId}&title=${encodeURIComponent(title)}&source=general`
      );
    } else {
      router.push(
        `/writing/general?template=${templateId}&title=${encodeURIComponent(title)}`
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* 第二层导航 - 职场办公 / 政务公文 */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center px-6 h-14">
          {generalWritingCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveSecondLevel(category.id);
                // 切换第二层时，重置第三层为第一个选项
                const newThirdCategories =
                  category.id === "workplace"
                    ? workplaceSubCategories
                    : governmentSubCategories;
                setActiveThirdLevel(newThirdCategories[0].id);
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
        {/* 左侧 - 第三层导航 */}
        <div className="w-48 border-r border-border bg-card overflow-y-auto">
          <div className="p-2">
            {currentThirdLevelCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveThirdLevel(category.id)}
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
        </div>

        {/* 右侧 - 第四层模板展示 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentTemplates.map((template) => (
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

          {/* 空状态提示 */}
          {currentTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-sm">暂无模板</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
