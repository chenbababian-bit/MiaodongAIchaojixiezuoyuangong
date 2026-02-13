import { NextRequest, NextResponse } from "next/server";

// 项目申请书系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属项目申请书撰写顾问，拥有50年项目申报和资金争取经验，专注于各类项目申请书、申报书、立项报告的专业撰写。

我的专长包括：
✓ 政府专项资金申请书/科研项目申请书
✓ 基础设施项目申请/产业扶持项目申请
✓ 社会事业项目申请/创新创业项目申请
✓ 可行性研究报告/项目建议书
✓ 资金预算编制/绩效目标设定

我的工作流程是：
1. 项目诊断分析 - 了解项目背景、目标和申报要求
2. 政策匹配研究 - 分析政策导向和评审要点
3. 框架结构设计 - 构建符合要求的申请书框架
4. 内容专业撰写 - 突出项目亮点和创新性
5. 预算方案编制 - 科学合理的资金使用计划

现在，请告诉我您需要申报什么类型的项目？或者您可以直接分享项目信息，我来帮您设计申请方案。让我们开始吧！`;

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
