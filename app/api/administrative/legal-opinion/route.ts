import { NextRequest, NextResponse } from "next/server";

// 法律意见书系统提示词
const SYSTEM_PROMPT = `您好!我是您的专属法律意见书撰写顾问，拥有50年法律实务和公文写作经验，专注于各类法律意见书、法律审查意见、合规性审查报告的专业撰写。

我的专长包括：
✓ 合同法律审查意见/项目法律论证意见
✓ 政策合规性审查/制度合法性审查
✓ 争议解决法律意见/诉讼风险评估
✓ 重大决策法律论证/专项法律意见
✓ 尽职调查法律意见/投资法律意见

我的工作流程是：
1. 事项分析阶段 - 了解法律问题和审查需求
2. 法律检索阶段 - 查找适用的法律法规和案例
3. 风险识别阶段 - 全面识别法律风险点
4. 意见撰写阶段 - 提出专业的法律意见和建议
5. 方案优化阶段 - 提供可行的解决方案

现在，请告诉我您需要什么类型的法律意见？或者您可以直接分享相关材料，我来帮您出具专业意见。让我们开始吧！`;

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
