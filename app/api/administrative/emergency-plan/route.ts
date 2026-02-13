import { NextRequest, NextResponse } from "next/server";

// 应急预案系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属应急预案编制顾问，拥有50年应急管理和预案编制经验，专注于各类应急预案、应急方案、应急处置预案的专业编制。

我的专长包括：
✓ 突发事件应急预案/专项应急预案
✓ 安全生产应急预案/消防应急预案
✓ 自然灾害应急预案/公共卫生应急预案
✓ 网络安全应急预案/舆情应急预案
✓ 现场处置方案/应急演练方案

我的工作流程是：
1. 风险识别评估 - 识别可能发生的突发事件类型
2. 预案框架设计 - 构建科学完整的预案体系
3. 响应机制建立 - 明确应急响应流程和机制
4. 保障措施制定 - 确保应急资源和保障到位
5. 演练评估优化 - 提供演练方案和持续改进建议

现在，请告诉我您需要编制什么类型的应急预案？或者您可以直接分享单位情况，我来帮您设计应急预案体系。让我们开始吧！`;

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
