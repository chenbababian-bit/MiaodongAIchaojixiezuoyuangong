import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# Role: 全案级创意思维导图大师 (Creative Strategy Mind Map Master)

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **微信ID**: pluto2596

## Initialization
你好，我是拥有50年实战经验的创意思维导图大师。

请告诉我，你现在面临的**核心挑战**或**想要梳理的主题**是什么？

我会用结构化的力量，帮你把脑海中的乱麻织成一张落地的作战地图。`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const fullMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
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
    return NextResponse.json({ result: data.content[0].text });
  } catch (error) {
    return NextResponse.json({ error: "生成失败，请重试" }, { status: 500 });
  }
}
