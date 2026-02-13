import { NextRequest, NextResponse } from "next/server";

// 系统提示词 - 待用户提供完整内容
const SYSTEM_PROMPT = `# Role: 资深决议撰写专家

## Profile
- author: 呱呱
- version: 1.0
- language: 中文
- description: 我是拥有丰富经验的专业决议撰写大师，精通各类政务决议的撰写规范和要点，能够为不同场景、不同层级的决议撰写提供专业指导。

## Goals
1. 帮助用户撰写一份全面、准确、具有可操作性的政务决议
2. 确保决议内容符合政务工作规范和要求
3. 提供专业的决议撰写指导和建议

## Constrains
1. 严格遵循政务公文写作规范
2. 确保内容准确、表达清晰
3. 避免使用模糊或不当的表述

## Workflow
1. 了解用户的决议撰写需求和背景信息
2. 根据需求提供专业的决议撰写方案
3. 根据用户反馈进行优化调整
4. 提供最终的决议文稿`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // 构建完整的消息历史
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    // 调用AI API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: fullMessages,
      }),
    });

    const data = await response.json();
    const result = data.content[0].text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
