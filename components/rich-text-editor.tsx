"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  ChevronDown,
  Indent,
  Outdent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  className?: string;
}

export function RichTextEditor({
  initialContent = "",
  onChange,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  // 初始化内容
  useEffect(() => {
    if (editorRef.current && initialContent) {
      // 将纯文本转换为带格式的 HTML，清理 Markdown 标记
      const formattedContent = initialContent
        .split("\n")
        .map((line) => {
          // 清理行内的 ** 标记（粗体）
          let cleanLine = line.replace(/\*\*(.*?)\*\*/g, "$1");

          if (cleanLine.startsWith("### ")) {
            return `<h3>${cleanLine.substring(4)}</h3>`;
          } else if (cleanLine.startsWith("## ")) {
            return `<h2>${cleanLine.substring(3)}</h2>`;
          } else if (cleanLine.startsWith("# ")) {
            return `<h1>${cleanLine.substring(2)}</h1>`;
          } else if (cleanLine.startsWith("*   ")) {
            return `<p>${cleanLine.substring(4)}</p>`;
          } else if (cleanLine.startsWith("---")) {
            return `<hr/>`;
          } else if (cleanLine.trim() === "") {
            return `<p><br/></p>`;
          } else {
            return `<p>${cleanLine}</p>`;
          }
        })
        .join("");
      editorRef.current.innerHTML = formattedContent;
      updateWordCount();
    }
  }, [initialContent]);

  // 更新字数统计
  const updateWordCount = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setWordCount(text.replace(/\s/g, "").length);
    }
  }, []);

  // 检查当前格式状态
  const checkFormatState = useCallback(() => {
    setCurrentFormat({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  // 执行格式命令
  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      checkFormatState();
      updateWordCount();
      if (onChange && editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    },
    [onChange, checkFormatState, updateWordCount]
  );

  // 设置标题级别
  const setHeading = useCallback(
    (level: string) => {
      if (level === "p") {
        execCommand("formatBlock", "p");
      } else {
        execCommand("formatBlock", level);
      }
    },
    [execCommand]
  );

  // 处理输入变化
  const handleInput = useCallback(() => {
    updateWordCount();
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, updateWordCount]);

  // 处理选择变化
  const handleSelectionChange = useCallback(() => {
    checkFormatState();
  }, [checkFormatState]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return (
    <div className={cn("flex flex-col h-full bg-background rounded-lg", className)}>
      {/* Toolbar */}
      <div className="border-b border-border p-2 space-y-2">
        {/* First Row */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Font Style Dropdown */}
          <Select defaultValue="normal" onValueChange={(v) => setHeading(v)}>
            <SelectTrigger className="w-[80px] h-8 text-xs">
              <SelectValue placeholder="粗体" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">正文</SelectItem>
              <SelectItem value="h1">标题1</SelectItem>
              <SelectItem value="h2">标题2</SelectItem>
              <SelectItem value="h3">标题3</SelectItem>
            </SelectContent>
          </Select>

          {/* Heading Buttons */}
          <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-normal"
              onClick={() => setHeading("h1")}
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-normal"
              onClick={() => setHeading("h2")}
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-normal"
              onClick={() => setHeading("h3")}
            >
              H3
            </Button>
          </div>

          {/* Format Buttons */}
          <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", currentFormat.bold && "bg-muted")}
              onClick={() => execCommand("bold")}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", currentFormat.italic && "bg-muted")}
              onClick={() => execCommand("italic")}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 w-8 p-0", currentFormat.underline && "bg-muted")}
              onClick={() => execCommand("underline")}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Highlighter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => execCommand("backColor", "#FFEB3B")}>
                  <div className="w-4 h-4 rounded bg-yellow-400 mr-2" />
                  黄色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("backColor", "#4CAF50")}>
                  <div className="w-4 h-4 rounded bg-green-500 mr-2" />
                  绿色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("backColor", "#2196F3")}>
                  <div className="w-4 h-4 rounded bg-blue-500 mr-2" />
                  蓝色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("backColor", "#F44336")}>
                  <div className="w-4 h-4 rounded bg-red-500 mr-2" />
                  红色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("removeFormat")}>
                  清除高亮
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Text Color */}
          <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                  <span className="text-xs font-bold underline decoration-2 decoration-red-500">A</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => execCommand("foreColor", "#000000")}>
                  <div className="w-4 h-4 rounded bg-black mr-2" />
                  黑色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("foreColor", "#F44336")}>
                  <div className="w-4 h-4 rounded bg-red-500 mr-2" />
                  红色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("foreColor", "#2196F3")}>
                  <div className="w-4 h-4 rounded bg-blue-500 mr-2" />
                  蓝色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("foreColor", "#4CAF50")}>
                  <div className="w-4 h-4 rounded bg-green-500 mr-2" />
                  绿色
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => execCommand("foreColor", "#FF9800")}>
                  <div className="w-4 h-4 rounded bg-orange-500 mr-2" />
                  橙色
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("justifyLeft")}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("justifyCenter")}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("justifyRight")}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("justifyFull")}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Indent */}
          <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("outdent")}
            >
              <Outdent className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("indent")}
            >
              <Indent className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              扩写
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                  改写
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>更正式</DropdownMenuItem>
                <DropdownMenuItem>更口语化</DropdownMenuItem>
                <DropdownMenuItem>更简洁</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              简写
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              续写
            </Button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 border-l border-border pl-2 ml-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("undo")}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => execCommand("redo")}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-full p-4 outline-none prose prose-sm dark:prose-invert max-w-none
            [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:mt-4
            [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:mt-3
            [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-3
            [&>p]:mb-2 [&>p]:leading-relaxed
            [&>hr]:my-4 [&>hr]:border-border"
          onInput={handleInput}
          suppressContentEditableWarning
        />
      </div>

      {/* Footer - Word Count */}
      <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{wordCount}字</span>
      </div>
    </div>
  );
}
