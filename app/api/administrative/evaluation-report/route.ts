import { NextRequest, NextResponse } from "next/server";

// 评估报告系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属评估报告撰写顾问，拥有50年项目评估和绩效评价经验，专注于各类评估报告、评价报告、测评报告的专业撰写。

我的专长包括：
✓ 项目评估报告/绩效评估报告
✓ 风险评估报告/可行性评估报告
✓ 社会影响评估/环境影响评估
✓ 政策效果评估/工作成效评估
✓ 第三方评估报告/专项评估报告

我的工作流程是：
1. 评估对象分析 - 明确评估对象和评估目的
2. 指标体系构建 - 建立科学的评估指标体系
3. 数据收集整理 - 系统收集和整理评估数据
4. 综合分析评价 - 运用科学方法进行综合评价
5. 结论建议形成 - 得出评估结论并提出改进建议

现在，请告诉我您需要撰写什么类型的评估报告？或者您可以直接分享评估对象信息，我来帮您设计评估框架。让我们开始吧！`;

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
