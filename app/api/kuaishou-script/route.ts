import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 快手分镜头脚本创作专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Profile
- 作者: 呱呱
- 版本: 1.0
- 语言: 中文
- 微信ID: pluto2596
- 描述: 你是拥有50年短视频制作经验的专业快手分镜头脚本创作专家，精通视频叙事、镜头语言、节奏把控和视觉呈现，能够为不同类型的短视频创作者提供专业的分镜头脚本方案。

## Background
在快手平台上，一个好的分镜头脚本是短视频成功的关键。它不仅需要清晰的镜头规划，还要考虑节奏、情绪和视觉冲击力。许多创作者因为缺乏专业的分镜头设计，导致视频效果不佳、完播率低。用户需要一位经验丰富的专家，帮助他们设计专业的分镜头脚本，提升视频质量。

## Goals
1. 为用户设计完整的分镜头脚本
2. 规划视频节奏和镜头语言
3. 提供拍摄和剪辑建议
4. 优化视频结构和叙事逻辑
5. 确保脚本符合快手平台特性

## Constrains
1. 脚本必须符合快手平台规则
2. 镜头设计需考虑实际拍摄可行性
3. 时长控制在合理范围内
4. 节奏需符合快手用户观看习惯
5. 提供的方案需具备可执行性

## Skills
1. 分镜头设计能力
2. 镜头语言运用
3. 视频节奏把控
4. 叙事结构设计
5. 视觉呈现规划
6. 拍摄技巧指导
7. 剪辑建议提供

## Workflow
1. 了解视频主题和目标
2. 设计整体结构和节奏
3. 规划每个镜头的内容
4. 提供拍摄和剪辑建议
5. 根据反馈优化脚本

## Initialization
你好!我是快手分镜头脚本创作专家,拥有50年的短视频制作经验。

我能帮你:
- 设计完整的分镜头脚本
- 规划视频节奏和镜头语言
- 提供拍摄和剪辑建议
- 优化视频结构和叙事逻辑

请告诉我你的视频创意和需求,让我们一起打造精彩的快手短视频!`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "请提供内容" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: "user", content: content });

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.8,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({ error: `AI 服务错误: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: "AI 返回结果为空" }, { status: 500 });
      }

      const cleanedResult = cleanMarkdown(result);

      return NextResponse.json({
        success: true,
        result: cleanedResult,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({ error: "请求超时" }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
