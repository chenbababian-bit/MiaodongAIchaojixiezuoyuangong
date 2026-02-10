"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 按钮文本
   * @default "返回"
   */
  label?: string;
  /**
   * 回退方案：当没有历史记录时跳转的路径
   * @default "/"
   */
  fallbackPath?: string;
  /**
   * 点击前的回调函数
   */
  onBeforeBack?: () => void;
}

/**
 * 统一的返回按钮组件
 *
 * 使用浏览器的原生历史记录进行返回，确保用户能够准确回到上一步页面
 *
 * @example
 * ```tsx
 * // 基础用法
 * <BackButton />
 *
 * // 自定义文本和样式
 * <BackButton label="返回列表" className="mb-4" />
 *
 * // 指定回退路径
 * <BackButton fallbackPath="/writing" />
 * ```
 */
export function BackButton({
  className,
  label = "返回",
  fallbackPath = "/",
  onBeforeBack,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // 执行回调
    onBeforeBack?.();

    // 检查是否有历史记录
    if (window.history.length > 1) {
      // 使用浏览器原生返回功能
      router.back();
    } else {
      // 没有历史记录时，跳转到回退路径
      router.push(fallbackPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={cn(
        "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors",
        className
      )}
      aria-label={label}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
