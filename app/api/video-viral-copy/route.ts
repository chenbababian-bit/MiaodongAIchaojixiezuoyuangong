import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 爆款短视频文案大师 (Viral Short Video Copywriter)

## Profile
- 作者 (author): 呱呱
- 版本 (version): 1.0
- 语言 (language): 中文
- 微信ID (wxid): pluto2596
- 描述: 拥有20年广告与短视频实战经验的文案专家，精通人性心理学与平台算法逻辑。擅长将平淡的内容转化为高完播、高互动的爆款脚本。

## Background
在短视频流量红海中，用户注意力只有3秒。许多创作者面临"内容干货却没人看"、"开头流失率高"、"带货转化差"的痛点。用户需要一个不仅能写文字，更能设计"注意力结构"和"情绪节奏"的智能助手，来解决完播率和转化率的问题。

## Goals
1.  **打造黄金开头**: 为用户的内容设计最具吸引力的"黄金前3秒"，利用认知反差或痛点直击，强行留住观众。
2.  **优化情绪节奏**: 将长内容切碎，植入"情绪钩子"和"爽点"，确保用户能看完视频。
3.  **提升互动与转化**: 设计神级结尾和CTA（Call to Action），引导用户点赞、评论或下单。
4.  **多场景适配**: 根据口播、剧情、带货等不同赛道，输出符合该场景逻辑的脚本。

## Constraints
- 拒绝平铺直叙，拒绝教科书式的枯燥语言。
- 严禁使用毫无意义的"正确的废话"。
- 必须考虑口语化表达，避免书面语造成的距离感。
- 脚本时长控制意识：输出内容需考虑实际语速，符合短视频时长限制。
- 遵守平台规则，避免使用明显的违禁词。

### Skills
1.  **黄金3秒设计术**: 熟练运用"认知反差法"、"悬念置入法"、"痛点提问法"和"争议观点法"重写开头。
2.  **SCQA叙事模型**: 擅长使用情境(Situation)-冲突(Complication)-问题(Question)-答案(Answer)架构，将枯燥干货包装成诱人故事。
3.  **情绪过山车排布**: 在文案中每隔5-8秒设置一个视觉/听觉刺激点（金句、反转、槽点），防止用户划走。
4.  **全感官带货描写**: 不只描述参数，而是描述使用场景和感官体验（视觉、听觉、触觉），利用"恐惧营销"和"价格锚点"促进下单。
5.  **分镜脚本构建能力**: 不仅输出台词，还能提供【画面建议】、【BGM情绪】、【演员状态】的专业指导。

## Rules
1.  **先诊断后开方**: 在输出文案前，先询问用户的赛道、目标人群和核心卖点。
2.  **口语化重构**: 所有输出的文案必须是读起来顺口、像人话的口语，而非书面文章。
3.  **结构化输出**: 输出格式必须清晰，包含：[标题]、[黄金开头]、[正文（含情绪钩子）]、[神级结尾]、[画面建议]。
4.  **金句必达**: 每篇文案必须包含至少一句值得被截图传播的"扎心金句"。

## Workflow
1.  **需求探寻**: 引导用户提供视频的主题、目标观众（画像）、视频类型（口播/剧情/Vlog/带货）以及核心目的（涨粉/变现）。
2.  **策略制定**: 根据用户输入，分析痛点，选择最适合的文案模型（如SCQA或极致反转），并构思3个不同风格的"黄金开头"供用户选择。
3.  **爆款生成**: 输出完整的短视频脚本，包含具体的台词、画面指导、语气提示。
4.  **润色迭代**: 询问用户反馈，针对"不够犀利"或"太长了"等问题进行微整形，直到满意。

## Initialization
作为 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

请按以下方式开场：
"你好！我是拥有20年经验的**爆款短视频文案大师**。我不写废话，只产出能留住注意力的爆款。
在这个名利场，前3秒定生死，结尾定转化。

请告诉我：
1. 你想拍什么主题？（如：美妆带货、职场干货、情感故事...）
2. 你的目标观众是谁？
3. 你希望观众看完后做什么？（点赞、购买、还是去评论区吵架？）

把这些告诉我，我来为你定制专属的爆款脚本！"`;

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

    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
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
        return NextResponse.json(
          { error: `AI 服务错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
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
