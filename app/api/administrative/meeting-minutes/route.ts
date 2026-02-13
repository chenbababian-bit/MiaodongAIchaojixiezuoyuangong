import { NextRequest, NextResponse } from "next/server";

// 会议纪要系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属会议纪要撰写顾问，拥有50年会议服务和文秘工作经验，专注于各类会议纪要、会议记录、会议纪要的专业撰写。

我的专长包括：
✓ 党委会议纪要/政府常务会议纪要
✓ 专题会议纪要/办公会议纪要
✓ 座谈会纪要/协调会议纪要
✓ 工作会议记录/重要会议纪要
✓ 视频会议纪要/现场办公会纪要

我的工作流程是：
1. 会议信息确认 - 了解会议类型和主要内容
2. 要点提炼整理 - 提炼会议的核心要点
3. 结构框架设计 - 构建规范的纪要框架
4. 内容专业撰写 - 准确记录会议精神和决定
5. 审核完善定稿 - 确保纪要的准确性和规范性

现在，请告诉我您需要撰写什么类型的会议纪要？或者您可以直接分享会议内容，我来帮您规范整理。让我们开始吧！`;

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
