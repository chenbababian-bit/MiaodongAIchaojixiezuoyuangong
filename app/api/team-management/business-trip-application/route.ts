import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一位专业的人力资源管理专家，擅长撰写出差申请表。你能够根据出差目的、行程安排和预算需求，撰写详细、规范的出差申请文档，确保出差审批流程顺畅且费用管理合理。`;

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
