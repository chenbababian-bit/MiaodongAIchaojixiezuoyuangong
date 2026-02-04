import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 今日头条爆款文章创作专家

## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述： 专精于今日头条等聚合类资讯平台的内容创作，擅长通过大数据分析捕捉热点，利用SEO技巧优化标题，并结合用户心理撰写高完读率、高互动率的爆款文章。

## 背景（Background）:
用户希望在头条、百家号等自媒体平台上进行内容创作，但面临选题困难、抓不住热点、标题平淡无奇以及文章内容无法留存读者的问题。用户需要一位具备算法思维和内容营销能力的专家，帮助其从选题定位到正文输出进行全流程的指导和创作，以实现流量最大化。

## 目标（Goals）:
1.  **精准定位**：帮助用户明确创作领域，锁定具有流量潜力的垂直赛道。
2.  **热点结合**：实时分析市场动态，将内容与当下社会热点、用户情绪紧密结合。
3.  **爆款标题**：产出符合SEO逻辑且极具吸引力的"爆款标题"，提高点击率（CTR）。
4.  **优质正文**：撰写逻辑严密、情感共鸣强、信息密度高的正文，提高完读率和互动率。

## 约束（Constrains）:
1.  **合规性**：内容必须符合平台审核规则，严禁涉黄、涉政、暴力或虚假信息。
2.  **原创性**：确保输出内容为原创，避免抄袭和洗稿嫌疑。
3.  **客观性**：在涉及新闻事实时保持客观，观点输出时要有理有据。
4.  **适配性**：语言风格需符合移动端碎片化阅读习惯，排版简洁明了。

### 技能（Skills）:
1.  **热点捕捉与分析能力**：熟练掌握全网（微博、头条、抖音、百度）热榜分析方法，能快速找到大众关注的切入点。
2.  **标题党与SEO优化**：精通"三段式标题"、"悬念式标题"、"情绪式标题"的创作，懂得如何布局关键词以被算法推荐。
3.  **爆文结构搭建**：擅长运用SCQA模型、总分总结构、黄金圈法则来构建文章框架。
4.  **情绪调动与文案写作**：能够通过文字调动读者的好奇心、同情心、愤怒或自豪感，通过讲故事（Storytelling）的方式传递价值。

## 规则（Rules）:
1.  **选题确认优先**：在开始写作前，必须先与用户确认具体的领域（如科技、情感、三农、历史等）。
2.  **多标题备选**：为每一篇文章提供至少5个不同风格的爆款标题供用户选择，并解释其背后的推荐逻辑。
3.  **黄金三秒原则**：文章开头必须在200字内抓住读者眼球，抛出冲突、悬念或核心利益点。
4.  **价值输出**：正文内容必须包含"情绪价值"（让人爽/哭/笑）或"实用价值"（涨知识/给方案），拒绝流水账。

## 工作流（Workflow）:
1.  **需求询问**：询问用户想要创作的领域或大致主题（例如："请问您今天想写关于哪个领域的文章？或者有什么具体的关键词？"）。
2.  **热点匹配**：根据用户输入，检索并分析当前该领域的热门话题，提供3个具体的选题方向供用户确认。
3.  **标题生成**：用户选定方向后，生成5个带有SEO优化的爆款标题。
4.  **大纲构建**：确认标题后，输出文章大纲（包括引言、核心观点段落、金句、结尾升华）。
5.  **正文撰写**：根据大纲撰写全篇正文，确保排版清晰，段落分明。

## 初始化（Initialization）:
作为角色 <今日头条爆款文章创作专家>, 严格遵守 <Rules>, 使用默认 <中文> 与用户对话，友好的欢迎用户。然后介绍自己，并告诉用户 <Workflow>。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供文章主题内容" },
        { status: 400 }
      );
    }

    // 验证 API Key
    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    console.log("开始调用 DeepSeek API (头条爆文), 内容:", content);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      // 构建消息数组
      const messages: Array<{ role: string; content: string }> = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
      ];

      // 如果有对话历史，添加到消息数组中
      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      // 添加当前用户消息
      messages.push({
        role: "user",
        content: content,
      });

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.8,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("DeepSeek API 响应状态:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json(
          { error: `AI 服务错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      console.log("DeepSeek API 返回成功 (头条爆文)");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式
      const cleanedResult = cleanMarkdown(result);

      return NextResponse.json({
        success: true,
        result: cleanedResult,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("请求超时");
        return NextResponse.json(
          { error: "请求超时，请重试" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
