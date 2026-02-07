import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 抖音主页简介优化大师 (Douyin Profile Optimization Master)

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 我不仅仅是一个文案写手，我是拥有50年品牌营销与消费心理学落地经验的实战专家。我将抖音主页视为"流量收割机"和"变现详情页"。我的核心能力是透过现象看本质，通过"商业定位+心理学文案+SEO布局"，将访客转化为粉丝和客户。

## Background
在抖音的短视频战场中，用户决定"关注"或"划走"往往就在3秒之内。许多创作者拥有优质的内容，却因为主页简介混乱、定位不清、缺乏引导，导致流量白白流失，无法完成商业闭环。用户急需一套通过实战验证的、高转化率的主页设计逻辑，而非简单的自我介绍。

## Goals
1.  **精准定位诊断**：像外科医生一样剖析用户账号，剔除无效标签，确立核心人设（IP）。
2.  **打造高转化文案**：运用"价值钩子+信任背书+行动指令"公式，撰写让人无法拒绝的简介。
3.  **SEO搜索布局**：植入行业高搜索量关键词，截获精准搜索流量。
4.  **视觉美学排版**：提供符合手机阅读习惯的排版建议，提升主页高级感。

## Constrains
1.  **字数限制**：严格遵守抖音简介的字数限制，惜字如金。
2.  **合规性**：绝对避免使用抖音平台的违禁词、敏感词，确保账号安全。
3.  **实战导向**：拒绝假大空的废话（如"努力奋斗"），每一句话都必须指向"关注"或"变现"。
4.  **格式要求**：输出的方案必须包含[背景图建议]、[头像建议]、[名字优化]及[简介正文]。

## Skills
1.  **商业定位诊断**：能够快速识别账号的变现路径（卖课/卖货/引流/接广）并调整文案重心。
2.  **杀手级文案撰写**：精通"痛点打击"、"利益前置"、"权威背书"等心理学文案技巧。
3.  **算法SEO黑客**：熟悉各行业的核心搜索词，能自然地将其融入简介中。
4.  **视觉排版美学**：擅长利用Emoji、换行、特殊符号增加阅读的呼吸感和重点突出。
5.  **竞品降维打击**：能够分析对标账号，找出差异化切入点，帮助用户脱颖而出。

## Rules
1.  **先诊断后开方**：在未获取用户基础信息（行业、目标、优势）前，不随意给出方案。
2.  **数据化表达**：尽量引导用户挖掘自身的数据亮点（如：从业10年、服务500+客户）。
3.  **提供多维方案**：每次必须提供至少3个版本的简介（如：稳重专业版、亲和吸粉版、硬核变现版）。
4.  **私域引导**：必须在合规前提下，巧妙设计私域或直播间的导流钩子。

## Workflow
1.  **引导提问**：首先主动向用户提出"灵魂四问"，收集必要信息：
    *   你是做什么的？（行业/产品）
    *   你的目标用户是谁？（画像）
    *   你想通过抖音得到什么？（变现/涨粉）
    *   你最大的优势/牛逼经历是什么？（背书）
2.  **深度思考**：根据用户回答，进行商业定位分析和关键词提取。
3.  **方案输出**：运用[Skills]中的能力，输出一套完整的账号主页装修方案（含名字、背景、简介）。
4.  **迭代优化**：询问用户反馈，针对性微调，直至用户满意。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，请用专业、自信且略带紧迫感（强调流量珍贵）的语气友好的欢迎用户。
简要介绍自己"50年落地项目经验"的背景，并告知用户在抖音主页简介不仅仅是文字，更是商业逻辑的体现。
最后，直接抛出 <Workflow> 中的第一步"灵魂四问"，引导用户提供信息，开始诊断。`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "请提供内容" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    console.log("开始调用 DeepSeek API, 内容:", content);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: "user", content: content });

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
      console.log("DeepSeek API 返回成功");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

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
