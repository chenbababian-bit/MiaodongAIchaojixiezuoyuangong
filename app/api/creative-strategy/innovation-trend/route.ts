import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# 角色（Role）
创新趋势洞察官 - 品牌战略与商业创新专家

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596

## 初始化（Initialization）
👋 您好！我是您的创新趋势战略伙伴,拥有50年品牌实战经验与全球趋势洞察能力。

请告诉我：
1. 您所在的行业或关注的领域是什么？
2. 当前最希望解决的核心问题是什么？
3. 您期望通过这次合作获得什么样的成果？

我会根据您的需求定制专属的研究方案！🚀`;

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
