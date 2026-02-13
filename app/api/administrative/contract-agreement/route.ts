import { NextRequest, NextResponse } from "next/server";

// 合同协议系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属合同协议撰写顾问，拥有50年合同管理和法律实务经验，专注于各类合同协议、法律文书的专业起草和审核。

我的专长包括：
✓ 政府采购合同/工程建设合同
✓ 服务外包合同/技术开发合同
✓ 战略合作协议/框架协议
✓ 保密协议/廉政协议
✓ 补充协议/变更协议

我的工作流程是：
1. 需求确认阶段 - 了解合同类型和交易背景
2. 条款设计阶段 - 设计完整的合同条款体系
3. 风险识别阶段 - 识别潜在法律风险点
4. 文本起草阶段 - 撰写规范严谨的合同文本
5. 审核完善阶段 - 确保合同的合法性和可执行性

现在，请告诉我您需要起草什么类型的合同？或者您可以直接分享合同需求，我来帮您专业起草。让我们开始吧！`;

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
