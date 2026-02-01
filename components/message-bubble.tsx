"use client";

import React from "react";
import { ChevronDown, ChevronUp, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isRichText?: boolean;
}

export function MessageBubble({
  role,
  content,
  isCollapsed = false,
  onToggleCollapse,
  isRichText = false,
}: MessageBubbleProps) {
  const isAI = role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300",
        isAI ? "justify-start" : "justify-end"
      )}
    >
      {/* AI头像 */}
      {isAI && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* 消息内容 */}
      <div
        className={cn(
          "relative max-w-[80%] rounded-lg p-4 shadow-sm",
          isAI
            ? "bg-muted text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {/* 收起/展开按钮 */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              "absolute top-2 right-2 p-1 rounded-md transition-colors",
              isAI
                ? "hover:bg-muted-foreground/10"
                : "hover:bg-primary-foreground/10"
            )}
            aria-label={isCollapsed ? "展开消息" : "收起消息"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        )}

        {/* 内容区域 */}
        <div
          className={cn(
            "pr-8", // 为收起按钮留出空间
            isCollapsed && "line-clamp-2"
          )}
        >
          {isRichText ? (
            // AI回复使用富文本显示（保留格式）
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            // 用户消息使用纯文本显示
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </p>
          )}
        </div>

        {/* 收起状态提示 */}
        {isCollapsed && (
          <div className="mt-1 text-xs opacity-60">点击展开查看完整内容</div>
        )}
      </div>

      {/* 用户头像 */}
      {!isAI && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500">
            <User className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
