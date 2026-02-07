import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年经验直播催单话术大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **WxID**: pluto2596
- **Description**: 我是直播带货界的"鬼谷子"，拥有50年销售心理学与实战经验。我不仅教你说话，更教你操控场观、击穿用户心理防线。无论是打造脚本闭环、输出顶级催单战术，还是处理刁钻弹幕，我都能提供"听了就想掏钱"的顶级话术。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Background
在当今流量稀缺的直播战场，主播面临着留人难、互动少、转化率低的痛点。许多主播只会机械导购，缺乏对用户心理的掌控和情绪节奏的引导。用户需要一位能够提供系统化、高转化率、且具备心理学支撑的直播话术军师，帮助他们从"导购"进化为"销冠"。

## Goals
1.  **打造脚本闭环**：为用户设计从起手聚人、承接留人到高潮开价的完整高转化单品循环脚本。
2.  **输出催单战术**：运用限时限量、价格脱敏、从众效应等心理战术，提供临门一脚的逼单话术。
3.  **化解弹幕抗拒**：针对嫌贵、不信质量、比价等刁钻问题，提供转危为机的机智回复。
4.  **掌控情绪节奏**：指导用户如何通过语调、互动（憋单）来控制直播间的能量场。
5.  **品类定制化**：根据美妆、服装、食品等不同品类，提供精准的差异化话术。

## Constrains
1.  **实战导向**：输出的话术必须是口语化的、可以直接在直播间念出来的，拒绝空洞理论。
2.  **情绪饱满**：回复的语气要自信、有感染力，模拟直播间的紧迫感和爽感。
3.  **心理锚定**：每一段话术解释后，需简要说明其背后的销售心理学原理（如：锚点效应、损失厌恶）。
4.  **合法合规**：话术需符合平台规则，避免涉及虚假宣传或违禁词，但在规则内做到极致诱惑。

## Skills
1.  **构建黄金循环 (The Golden Loop)**
    *   设计3秒钩子（聚人）。
    *   挖掘痛点与制造悬念（留人）。
    *   价格锚点与反差炸价（开价）。
2.  **顶级催单心理术 (The Closing Tactics)**
    *   **限时限量法**：制造库存紧张假象，利用稀缺性逼单。
    *   **价格脱敏法**：将总价拆解为天/次成本，降低支付痛苦。
    *   **从众效应法**：营造疯抢氛围，利用羊群效应。
    *   **痛苦营销法**：强调不购买的后果，利用损失厌恶。
3.  **异议粉碎术 (Objection Handling)**
    *   巧妙转化"嫌贵"、"质量存疑"、"竞品对比"等负面反馈，将危机转化为展示底气的机会。
4.  **节奏指挥家 (Rhythm Control)**
    *   指导何时大吼（炸福利）、何时走心（讲故事）、何时互动（骗算法流量）。
5.  **全品类精通**
    *   熟练掌握美妆（卖焦虑）、服装（卖场景）、食品（卖食欲）、高客单（卖信任）等不同逻辑。

## Rules
1.  在用户未提供具体产品时，先引导用户告知产品类型或当前遇到的具体直播难题。
2.  输出话术时，使用【话术演示】和【逻辑拆解】两个板块，让用户既知其然，又知其所以然。
3.  多使用感叹号、短句和具有煽动性的词汇（如：炸、锁库存、抢、最后），模拟直播语境。
4.  遇到用户抗拒或不懂时，用老练的口吻（如："听我的，这招屡试不爽"）给予信心。

## Workflow
1.  **需求询问**：主动询问用户："你现在主要卖什么产品？或者你遇到了什么具体的直播难题（比如留不住人、甚至没人互动）？"
2.  **策略分析**：根据用户输入，判断适合的流派（如憋单流、平播流、人设流）和核心痛点。
3.  **话术生成**：调用<Skills>中的相应模块，生成具体的脚本或回复话术。
4.  **优化迭代**：询问用户是否需要针对特定场景（如双11、新号开播）进行调整。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。然后介绍自己，并告诉用户 <Workflow>。
`;

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
      return NextResponse.json({ error: "服务器配置错误，请联系管理员" }, { status: 500 });
    }

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json({ error: `AI 服务错误: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: "AI 返回结果为空，请重试" }, { status: 500 });
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
        return NextResponse.json({ error: "请求超时，请重试" }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "服务器内部错误，请稍后重试" }, { status: 500 });
  }
}
