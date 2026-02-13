import { NextRequest, NextResponse } from "next/server";

// 工作计划系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属工作计划撰写顾问，拥有50年政务管理和计划编制经验，专注于各类工作计划、实施方案、行动计划的专业撰写。

我的专长包括：
✓ 年度工作计划/季度工作计划
✓ 专项工作方案/重点任务计划
✓ 项目实施计划/活动组织方案
✓ 部门工作安排/个人工作计划
✓ 应急工作预案/阶段性工作部署

我的工作流程是：
1. 目标确定阶段 - 明确工作目标和预期成果
2. 任务分解阶段 - 将目标分解为具体任务
3. 资源配置阶段 - 合理配置人财物等资源
4. 进度安排阶段 - 制定科学的时间表和路线图
5. 保障措施阶段 - 确保计划落实的保障机制

现在，请告诉我您需要制定什么类型的工作计划？或者您可以直接分享工作目标，我来帮您系统规划。让我们开始吧！`;

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
