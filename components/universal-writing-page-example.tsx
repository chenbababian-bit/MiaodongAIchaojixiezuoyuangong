/**
 * 通用写作页面组件 - 改进版示例
 *
 * 优点：
 * 1. 遵循单一职责：只负责UI展示和用户交互
 * 2. 配置驱动：API端点、路由等从配置读取
 * 3. 类型安全：TypeScript类型系统保证
 * 4. 易于扩展：新增模板无需修改代码
 */

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getTemplateConfig,
  getTemplateApiEndpoint,
  getTemplateRoutePath,
  getTemplatesByCategory,
  type TemplateCategory,
} from "@/lib/template-config";

interface UniversalWritingPageProps {
  category: TemplateCategory;
  pageTitle: string;
}

export function UniversalWritingPage({
  category,
  pageTitle,
}: UniversalWritingPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "";

  const [contentInput, setContentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState("");
  const [error, setError] = useState("");

  // 从配置获取当前模板信息
  const templateConfig = getTemplateConfig(templateId);
  const categoryTemplates = getTemplatesByCategory(category);

  // 智能创作 - 使用配置驱动的API端点
  const handleSubmit = async () => {
    if (!contentInput.trim()) {
      setError("请输入内容描述");
      return;
    }

    if (!templateConfig) {
      setError("模板配置错误");
      return;
    }

    setIsLoading(true);
    setError("");
    setCurrentResult("");

    try {
      // 从配置获取API端点，无需if-else判断
      const apiEndpoint = templateConfig.apiEndpoint;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentInput,
          // 其他字段可根据 templateConfig.customFields 动态添加
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

  // 模板点击处理 - 使用配置驱动的路由跳转
  const handleTemplateClick = (clickedTemplateId: string) => {
    const config = getTemplateConfig(clickedTemplateId);
    if (!config) return;

    // 从配置获取路由路径，无需硬编码
    const routePath = config.routePath;
    router.push(
      `${routePath}?template=${clickedTemplateId}&title=${encodeURIComponent(config.title)}`
    );
  };

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* 左侧模板列表 */}
      <div className="w-[280px] border-r">
        <div className="p-4">
          <h2>{pageTitle}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {categoryTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template.id)}
              className={
                templateId === template.id ? "bg-primary" : "hover:bg-muted"
              }
            >
              <div className={template.iconBg}>{template.icon}</div>
              <div>
                <h3>{template.title}</h3>
                <p>{template.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 中间表单区域 */}
      <div className="flex-1">
        <div className="p-6">
          <h1>{templateConfig?.title || "请选择模板"}</h1>

          <textarea
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder="请输入内容描述..."
          />

          {/* 根据配置动态渲染自定义字段 */}
          {templateConfig?.customFields?.videoType && (
            <select>
              <option>口播</option>
              <option>剧情</option>
              <option>带货</option>
            </select>
          )}

          {templateConfig?.customFields?.audience && (
            <input placeholder="目标观众" />
          )}

          {error && <div className="error">{error}</div>}

          <button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "创作中..." : "智能创作"}
          </button>
        </div>
      </div>

      {/* 右侧结果区域 */}
      <div className="w-[400px] border-l">
        {isLoading ? (
          <div>加载中...</div>
        ) : currentResult ? (
          <div>{currentResult}</div>
        ) : (
          <div>等待创作结果...</div>
        )}
      </div>
    </div>
  );
}

/**
 * 使用示例：
 *
 * // app/writing/xiaohongshu/page.tsx
 * export default function XiaohongshuPage() {
 *   return (
 *     <AppLayout>
 *       <UniversalWritingPage
 *         category="xiaohongshu"
 *         pageTitle="小红书文案创作"
 *       />
 *     </AppLayout>
 *   );
 * }
 *
 * // app/writing/video/page.tsx
 * export default function VideoPage() {
 *   return (
 *     <AppLayout>
 *       <UniversalWritingPage
 *         category="video"
 *         pageTitle="短视频文案创作"
 *       />
 *     </AppLayout>
 *   );
 * }
 */
