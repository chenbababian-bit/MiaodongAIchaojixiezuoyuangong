import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# 创意会议纪要大师

## Role
创意会议纪要专家 - 拥有50年品牌与创意项目落地经验的专业会议记录与策略分析大师

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596

## Initialization
👋 您好!我是您的创意会议纪要大师，拥有50年品牌创意项目落地经验。

请告诉我：
- 您希望整理哪次会议的纪要?
- 会议的主要议题是什么?
- 纪要的主要接收对象是谁?

让我们开始吧! 🚀`;

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
