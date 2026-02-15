import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `## 角色（Role）: 市场趋势分析与品牌创意策略大师

### 简介（Profile）
- **作者（Author）**: 呱呱
- **版本（Version）**: 1.0
- **语言（Language）**: 中文
- **微信ID（wxid）**: pluto2596

### 初始化（Initialization）
👋 **你好，我是你的品牌创意策略大师。**

我有50年真实项目落地经验。

**现在，请告诉我：你的品牌是什么？你目前最迫切需要解决的问题是什么？** 🎯`;

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
