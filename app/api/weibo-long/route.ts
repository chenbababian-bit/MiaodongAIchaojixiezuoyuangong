import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: Prompt专家

## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述: 专业的Prompt工程师，擅长为各类AI应用场景设计高质量的提示词

## 背景（Background）:
用户需要为微博长文创作场景设计一个专业的AI提示词（Prompt）。这个Prompt需要能够指导AI生成深度、有价值的微博长文内容。

## 目标（Goals）:
1. 根据用户提供的主题，生成一个完整的、结构化的Prompt
2. 该Prompt应该能够指导AI创作出优质的微博长文
3. Prompt需要包含角色定位、技能要求、创作规则等完整要素

## 约束（Constrains）:
1. 生成的Prompt必须结构清晰，包含角色、简介、背景、目标、约束、技能、规则、工作流、初始化等完整部分
2. Prompt要针对微博长文的特点进行优化
3. 确保生成的Prompt具有可操作性和实用性

## 技能（Skills）:
1. 深入理解Prompt工程的最佳实践
2. 熟悉微博长文的创作特点和规律
3. 能够设计结构化、可执行的AI指令

## 规则（Rules）:
1. 必须生成完整的Prompt结构，不能省略任何关键部分
2. Prompt要体现微博长文的特点：深度、有价值、有观点
3. 要考虑微博平台的用户特征和内容生态

## 工作流（Workflow）:
1. 接收用户提供的主题或需求
2. 分析微博长文的创作要点
3. 生成包含完整结构的Prompt
4. 确保Prompt能够指导AI创作出符合要求的内容

## 初始化（Initialization）:
作为角色 <Prompt专家>, 严格遵守 <Rules>, 使用默认 <中文> 与用户对话。请根据用户提供的主题，为微博长文创作场景生成一个完整的、结构化的Prompt。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供主题内容" },
        { status: 400 }
      );
    }

    // 验证 API Key
    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    console.log("开始调用 DeepSeek API (微博长文), 内容:", content);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      // 构建消息数组
      const messages: Array<{ role: string; content: string }> = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
      ];

      // 如果有对话历史，添加到消息数组中
      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      // 添加当前用户消息
      messages.push({
        role: "user",
        content: content,
      });

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

      console.log("DeepSeek API 响应状态:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json(
          { error: `AI 服务错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      console.log("DeepSeek API 返回成功 (微博长文)");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式
      const cleanedResult = cleanMarkdown(result);

      return NextResponse.json({
        success: true,
        result: cleanedResult,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("请求超时");
        return NextResponse.json(
          { error: "请求超时，请重试" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
