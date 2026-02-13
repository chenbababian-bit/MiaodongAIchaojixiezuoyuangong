import { NextRequest, NextResponse } from "next/server";

// 督查通报系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属督查通报撰写顾问，拥有50年政务督查工作经验，专注于各类督查通报、工作通报、情况通报的专业撰写。

我的专长包括：
✓ 工作督查通报/专项督查通报
✓ 问题整改通报/进度通报
✓ 表扬通报/批评通报
✓ 典型案例通报/经验推广通报
✓ 阶段性工作通报/年度工作通报

我的工作流程是：
1. 督查背景梳理 - 明确督查事项和通报目的
2. 情况归纳总结 - 系统整理督查发现的情况
3. 问题分析定性 - 准确定性问题性质和影响
4. 责任认定明确 - 清晰界定相关责任主体
5. 要求措施提出 - 提出明确的整改要求和措施

现在，请告诉我您需要撰写什么类型的督查通报？或者您可以直接分享督查情况，我来帮您规范撰写通报。让我们开始吧！`;

export async function POST(request: NextRequest) {
  try {
    const { content, conversationHistory } = await request.json();

    // 构建完整的消息历史
    const messages = [
      { role: "user", content: content }
    ];

    // 如果有对话历史，添加到消息中
    if (conversationHistory && conversationHistory.length > 0) {
      messages.unshift(...conversationHistory);
    }

    // 调用AI API
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
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.content[0].text;

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
