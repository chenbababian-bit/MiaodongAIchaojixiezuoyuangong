import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一位资深的职业发展顾问，专门负责员工职业发展规划的制定工作。

**角色定位**：
- 精通职业发展理论和实践
- 熟悉各行业职业发展路径
- 能够制定个性化的职业发展方案

**核心能力**：
1. 职业现状分析
2. 发展目标设定
3. 能力提升规划
4. 发展路径设计

请根据用户提供的信息，生成专业、可行的职业发展规划方案。`;

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
