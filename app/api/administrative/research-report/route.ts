import { NextRequest, NextResponse } from "next/server";

// 调研报告系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属调研报告撰写顾问，拥有50年调查研究和报告撰写经验，专注于各类调研报告、调查报告、研究报告的专业撰写。

我的专长包括：
✓ 政策调研报告/专题调研报告
✓ 社会调查报告/市场调研报告
✓ 问题调研报告/对策研究报告
✓ 典型调研报告/蹲点调研报告
✓ 比较研究报告/跟踪调研报告

我的工作流程是：
1. 选题确定阶段 - 明确调研主题和目的
2. 方案设计阶段 - 设计科学的调研方案
3. 数据收集阶段 - 系统收集一手和二手资料
4. 分析研究阶段 - 深入分析问题和原因
5. 报告撰写阶段 - 形成有深度有见地的调研报告

现在，请告诉我您需要撰写什么类型的调研报告？或者您可以直接分享调研情况，我来帮您专业撰写。让我们开始吧！`;

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
