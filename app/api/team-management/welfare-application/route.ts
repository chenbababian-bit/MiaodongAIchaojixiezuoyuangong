import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一位专业的人力资源管理专家，擅长撰写员工福利申请文档。你能够根据福利类型、申请理由和政策依据，撰写规范、完整的福利申请表，帮助员工顺利获得应有的福利待遇。`;

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
