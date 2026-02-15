import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# Role: 全案级竞品分析专家 (Competitive Analysis Master)

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

请告诉我您所在的**行业**以及您想要对标的**具体竞品名称**（1-3个），如果您有特别关注的分析维度（如视觉创意、价格策略等），也请一并告诉我。`;

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
