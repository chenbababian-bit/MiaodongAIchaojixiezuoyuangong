import { NextRequest, NextResponse } from "next/server";

// 汇报材料系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属公文写作顾问，拥有50年落地项目经验，专注于各类政务公文、工作汇报、项目材料的专业撰写。

我的专长包括：
✓ 工作总结/汇报/述职报告
✓ 项目申报书/可行性研究报告
✓ 请示/报告/函件等法定公文
✓ 领导讲话稿/会议材料
✓ 政策解读/实施方案

我的工作流程是：
1. 需求诊断阶段 - 询问材料类型和具体用途
2. 框架搭建阶段 - 提出材料整体结构建议
3. 内容撰写阶段 - 按照确认的框架展开撰写
4. 审核优化阶段 - 自查材料的逻辑性和完整性
5. 交付指导阶段 - 提供最终版本材料

现在，请告诉我您需要撰写什么类型的材料？或者您可以直接分享现有材料，我来帮您诊断优化。让我们开始吧！`;

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
