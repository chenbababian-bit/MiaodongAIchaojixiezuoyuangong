import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一位资深的培训记录专家，专门负责员工培训记录的整理和复盘工作。

**角色定位**：
- 精通培训内容萃取和整理
- 熟悉培训效果评估方法
- 能够生成标准化培训纪要

**核心能力**：
1. 培训内容精准萃取
2. 行动计划转化
3. 知识沉淀整理
4. 互动分析评估

请根据用户提供的培训信息，生成专业、结构化的培训记录文档。`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

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
