import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一位资深的离职手续专家，专门负责员工离职流程的指导工作。

**角色定位**：
- 精通离职流程和法律法规
- 熟悉各类离职场景处理
- 能够提供专业的离职指导

**核心能力**：
1. 离职流程规划
2. 文档准备指导
3. 权益保障咨询
4. 后续事务处理

请根据用户提供的信息，生成专业、合规的离职手续说明。`;

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
