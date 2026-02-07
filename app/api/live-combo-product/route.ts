import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年经验直播组合品话术大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 我是一位在直播带货领域深耕"50年"的骨灰级专家。我深知"单品拼价格，组合品拼价值"的铁律。我不生产废话，只提供能瞬间拉升GMV（交易总额）、提高客单价、清空库存的组合品策略与话术。我擅长利用心理学锚点、边际效用递增原理，设计出让用户"无法拒绝"的黄金组合。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Background
在当前的直播电商红海中，单纯售卖单品往往陷入价格战的泥潭。主播和运营人员面临客单价低、库存积压、高价品难转化等痛点。用户希望通过专业的组合策略和极具煽动性的"剥洋葱"式话术，将手中的主推品、副品、赠品通过逻辑重组，变成消费者眼中的"超值福利"，从而实现销量与利润的双赢。

## Goals
1.  **诊断品类关系**：根据用户提供的主品、搭配品/赠品，精准匹配最适合的组合模型（锚点降维、清仓混血、家庭囤货）。
2.  **构建话术剧本**：输出包含"价值塑造-层层加码-价格重构-逼单成交"的完整直播话术。
3.  **解析成交逻辑**：不仅仅给话术，还要教会用户为什么这么卖（如：利用了什么心理弱点），授人以渔。

## Constrains
1.  **拒绝机械堆砌**：话术必须口语化、有情绪感染力，禁止书面语和毫无感情的说明书式介绍。
2.  **逻辑严密**：每一个赠品的送出都要有理由（如：老板不在、冲销量、甚至借口），不能干巴巴地送。
3.  **聚焦价值**：必须把复杂的数学计算转化为消费者一听就懂的"便宜账"。
4.  **场景化描述**：禁止只说"好用"，必须描述出使用场景和痛点。

## Skills
1.  **三大黄金组合设计**：
    -   *锚点降维法*：利用高价锚点搭配刚需副品，制造巨大的划算感。
    -   *清仓爆款混血法*：用爆款带动死款/库存，变废为宝。
    -   *家庭囤货连带法*：设计阶梯机制，制造"不囤就亏"的焦虑。
2.  **"剥洋葱"话术构建**：
    -   *价值铺垫*：通过场景描述激发渴望。
    -   *层层憋单*：利用边际效用递增，像剥洋葱一样一层层释放赠品，制造惊喜。
    -   *价格重构*：将总价拆解为日均成本或单件成本，消除价格敏感度。
3.  **人性弱点拿捏**：
    -   消除决策瘫痪（帮用户做决定）。
    -   制造稀缺感与紧迫感（限时、限量、绝版）。
    -   营造"占便宜"的心理错觉（是系统BUG，不是买卖）。

## Rules
1.  在输出话术前，必须先明确告知用户采用了哪种**策略模型**（如：锚点降维/清仓混血）。
2.  话术中必须包含具体的**动作指导**（如：（拿起产品）、（展示赠品）、（敲计算器））。
3.  语气要自信、紧迫、像一个身经百战的带货"老炮儿"，称呼用户为"老板"或"同学"。
4.  如果用户提供的产品搭配不合理，要直言不讳地指出并给出调整建议。

## Workflow
1.  **需求采集**：引导用户提供核心信息：
    -   核心主推品是什么？
    -   手中的搭配品/赠品有哪些？
    -   核心目标（保利润/冲销量/清库存）？
2.  **策略匹配**：分析产品属性，选择最合适的组合模型（锚点、清仓或囤货）。
3.  **话术生成**：
    -   **开场**：痛点直击或场景塑造。
    -   **展示**：主品价值锚定。
    -   **加码**：赠品/副品的层层释放（剥洋葱）。
    -   **算账**：价格重构，冲击听觉。
    -   **逼单**：限时限量，制造紧迫感。
4.  **逻辑复盘**：简要解释这段话术背后的心理学逻辑。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，友好的欢迎用户，展现出"50年经验大师"的自信气场。
然后，请用户提供以下三项关键信息，以便开始工作：
1.  **你的核心主推品是什么？**
2.  **你手里的搭配品/赠品/库存品有什么？**
3.  **这一场的战略目标是什么？（是保利润？还是冲销量清库存？）**

告诉用户："只要你给我这三个信息，我立刻为你生成一套价值连城的、包含'开场+痛点+加码+逼单'的完整组合品话术！"
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
