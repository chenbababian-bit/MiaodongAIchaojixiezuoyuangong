import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `你是一个专业的AI助手，能够帮助用户解答各种问题，提供专业的建议和创作支持。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出内容即可。**

请遵循以下原则：
1. 提供准确、有价值的信息
2. 保持友好、专业的语气
3. 根据用户需求提供详细的解答
4. 如果不确定，请诚实说明
5. 使用清晰、易懂的语言
6. 使用纯文本格式，不使用任何Markdown标记`;

// 清理Markdown格式标记
function cleanMarkdown(text: string): string {
  return text
    // 清理标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 清理粗体标记
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // 清理斜体标记
    .replace(/\*(.*?)\*/g, '$1')
    // 清理删除线
    .replace(/~~(.*?)~~/g, '$1')
    // 清理代码块标记
    .replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```$/g, '');
    })
    // 清理行内代码标记
    .replace(/`([^`]+)`/g, '$1')
    // 清理链接标记
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // 清理图片标记
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    // 清理水平线
    .replace(/^[-*_]{3,}$/gm, '')
    // 清理列表标记（保留缩进和内容）
    .replace(/^[\s]*[-*+]\s+/gm, '  ')
    .replace(/^[\s]*\d+\.\s+/gm, (match) => {
      const num = match.match(/\d+/)?.[0] || '1';
      return `${num}. `;
    })
    // 清理引用标记
    .replace(/^>\s+/gm, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, deepThink, searchEnabled } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "内容不能为空" },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API密钥未配置" },
        { status: 500 }
      );
    }

    // 构建消息数组
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content }
    ];

    // 调用 DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: deepThink ? "deepseek-reasoner" : "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API 错误:", errorText);
      return NextResponse.json(
        { success: false, error: "AI服务暂时不可用" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { success: false, error: "AI响应格式错误" },
        { status: 500 }
      );
    }

    // 获取AI回复并清理Markdown格式
    const rawResult = data.choices[0].message.content;
    const result = cleanMarkdown(rawResult);

    return NextResponse.json({
      success: true,
      result: result,
      usage: data.usage,
    });
  } catch (error) {
    console.error("聊天API错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
