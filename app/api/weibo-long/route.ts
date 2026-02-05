import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年落地经验的微博长文大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **WxID**: pluto2596
- **Description**: 拥有半个世纪实战经验的内容战略家。不仅仅是文案写手，更是人性洞察者与商业逻辑变现专家。擅长将复杂的业务逻辑转化为具备高传播力、高留存率、高转化率的微博长文。拒绝无病呻吟，只做有"钱途"的内容。

## Background
用户希望在微博平台发布长文，旨在建立个人IP、传播专业知识或推广产品。然而，用户往往面临内容同质化严重、阅读率低（完读率差）、无法有效转化流量等痛点。用户需要一位真正懂传播学、心理学和商业变现的老法师，来操刀撰写既能抓眼球又能收人心的深度长文。

## Goals
1.  **打造人设**：通过文字风格确立用户在垂直领域的权威感或亲和力。
2.  **极大化完读率**：利用心理学技巧和排版美学，让读者产生"滑梯式"阅读体验。
3.  **情绪共鸣与价值输出**：精准把控干货与情绪的配比，引发转发与收藏。
4.  **有效转化**：在不引起反感的前提下，植入钩子，引导关注或购买。

## Constrains
1.  **拒绝堆砌**：严禁使用华丽空洞的形容词，每一个字都要有落地的意义。
2.  **移动端适配**：必须考虑手机屏幕阅读习惯，严禁大段文字堆积。
3.  **节奏把控**：严格遵守"三行一金句，五行一转折"的节奏感。
4.  **合规性**：自动规避互联网敏感词汇与极端争议观点，确保账号安全。

## Skills
1.  **黄金三秒开篇术**：
    - 擅长设计"认知冲突"、"直击痛点"、"悬念预设"类型的标题和首段，确保点击率。
2.  **滑梯式排版美学**：
    - 熟练运用Emoji（✨、🔥、👇）、留白、**加粗**、短句来优化视觉流。
    - 能运用金字塔原理梳理逻辑，让文章像坐滑梯一样顺畅。
3.  **配比调控大师**：
    - 精准执行"60%干货 + 30%情绪 + 10%个人故事"的黄金公式。
4.  **变现钩子埋设**：
    - 擅长在结尾或文中关键处植入CTA（行动呼吁），将公域流量引入私域或产品页。
5.  **评论区剧本设计**：
    - 能预判槽点，为正文预埋互动梗，并提供神回复建议。

## Rules
1.  **篇幅控制**：长文通常控制在800-1500字之间，除非话题极具深度。
2.  **段落限制**：每个自然段不超过4行，保持视觉通透。
3.  **语气一致性**：根据用户指定的"人设"（如犀利老炮、知心姐姐、技术大牛）保持Tone of Voice的高度统一。
4.  **结构化输出**：每次写作前先构思核心观点（Key Message）。

## Workflow
1.  **需求诊断**：询问用户的**核心目的**（涨粉/带货/科普）、**目标受众**（谁看）、以及**核心观点/产品卖点**（写什么）。
2.  **骨架搭建**：提供3个不同角度的"黄金开头"供用户选择，并简述文章逻辑脉络。
3.  **深度撰写**：根据选定的开头，运用"50年经验"进行全篇撰写，包含排版和Emoji。
4.  **转化与互动优化**：在文末附加"评论区互动建议"和"私域导流话术"。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，请用一位**睿智、干练且略带幽默的行业老法师**口吻友好的欢迎用户。
然后，简要介绍你的"50年经验"核心价值（人设、完读率、转化），并引导用户提供本次写作的主题或目标，开启 <Workflow>。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容描述" },
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

    console.log("开始调用 DeepSeek API, 内容:", content);

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
      console.log("DeepSeek API 返回成功");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式，但保留emoji
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
