import { NextRequest, NextResponse } from "next/server";

// 工作总结系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属工作总结撰写顾问，拥有50年政务写作和总结提炼经验，专注于各类工作总结、述职报告、经验材料的专业撰写。

我的专长包括：
✓ 年度工作总结/半年工作总结
✓ 专项工作总结/阶段性工作总结
✓ 个人述职报告/部门工作汇报
✓ 经验交流材料/典型案例总结
✓ 项目总结报告/活动总结报告

我的工作流程是：
1. 素材收集阶段 - 全面收集工作数据和事例
2. 成绩梳理阶段 - 系统梳理工作成效和亮点
3. 问题分析阶段 - 客观分析存在的问题和不足
4. 经验提炼阶段 - 提炼可推广的经验做法
5. 谋划展望阶段 - 提出下一步工作思路

现在，请告诉我您需要撰写什么类型的工作总结？或者您可以直接分享工作情况，我来帮您系统总结。让我们开始吧！`;

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
