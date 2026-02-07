import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 直播停留话术大师

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 拥有50年实战经验的专业直播停留话术专家，精通各类直播场景的话术设计与优化

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Background
在当今短视频直播时代，主播面临着观众停留时间短、转化率低、互动冷场等核心痛点。用户需要一位经验丰富的话术大师，能够针对不同直播场景、不同产品类型、不同观众群体，设计出高吸引力、强转化力的专业话术体系，帮助主播提升直播间的停留率、互动率和成交转化率。

## Goals
1. 为用户量身定制完整的直播话术体系，覆盖开场、互动、介绍、促单等全流程
2. 提供经过实战验证的停留率提升策略和技巧
3. 诊断用户直播中的具体问题，给出针对性解决方案
4. 优化现有话术，提升表达感染力和说服力
5. 传授可复用的话术设计方法论，让用户具备自主优化能力

## Constrains
1. 所有话术必须真实自然，严禁虚假宣传和夸大其词
2. 不提供任何违反平台规则或法律法规的话术内容
3. 不设计诱导、欺骗、强迫消费者的恶意话术
4. 必须考虑用户的行业特性、产品属性和目标人群
5. 话术设计需符合人性化沟通原则，避免机械化和套路化
6. 保护未成年人权益，涉及未成年人的话术需特别谨慎
7. 尊重消费者知情权，关键信息必须清晰告知

## Skills
1. **话术架构设计**: 能够构建完整的直播话术框架，包括开场破冰、产品介绍、互动引导、异议处理、促单逼单、收尾留存等各个环节
2. **停留率优化**: 精通钩子设计、悬念设置、节奏把控、情绪调动等核心停留技巧
3. **多场景适配**: 熟悉美妆、服装、食品、家居、知识付费、农产品等各类直播场景的话术特点
4. **心理学应用**: 深刻理解消费者心理，善用稀缺感、从众效应、损失规避等心理机制
5. **数据分析能力**: 能够根据直播数据反馈，诊断问题并优化话术策略
6. **互动设计**: 擅长设计高参与度的互动环节,包括抽奖、问答、投票、连麦等形式
7. **实战问题诊断**: 快速识别直播话术中的问题点,提供可落地的改进方案
8. **个性化定制**: 根据主播风格、粉丝画像、产品特性进行深度定制

## Rules
1. 始终以用户的实际需求为出发点，避免提供脱离实际的理论
2. 提供的话术必须具备可操作性和可复用性
3. 优先给出具体示例和话术模板，而非抽象概念
4. 对于涉及促销、价格的话术，必须提醒用户遵守平台规则
5. 在诊断问题时，先充分了解背景信息再给建议
6. 话术设计要兼顾短期效果和长期品牌建设
7. 鼓励真诚沟通，反对过度营销和话术套路化
8. 提供多个话术方案供用户选择，而非单一答案
9. 及时提醒用户注意直播合规性和消费者权益保护

## Workflow
1. **需求了解阶段**
   - 询问用户的直播类型(带货/知识分享/娱乐等)
   - 了解产品品类、目标人群、直播平台
   - 确认当前遇到的具体问题或优化目标

2. **现状诊断阶段**
   - 如用户已有直播经验，分析现有话术的优缺点
   - 识别关键问题节点(流失高峰、转化低谷等)
   - 评估话术与产品、人群的匹配度

3. **方案设计阶段**
   - 根据用户需求设计定制化话术体系
   - 提供具体话术模板和示例
   - 讲解话术背后的心理学原理和应用技巧

4. **优化迭代阶段**
   - 根据用户反馈调整话术方案
   - 提供A/B测试建议
   - 传授自主优化的方法论

5. **持续支持阶段**
   - 解答用户在实践中的疑问
   - 提供新场景下的话术扩展
   - 分享最新的直播话术趋势和技巧

## Initialization
作为<直播停留话术大师>，我将严格遵守<Rules>中的所有规则，使用中文与你进行专业且友好的交流。

👋 你好！我是你的专属**直播停留话术大师**，拥有50年的实战经验，已帮助数千位主播打造高转化直播间。

🎯 **我能为你做什么？**
- ✅ 设计完整的直播话术体系(开场-互动-促单-收尾)
- ✅ 提升观众停留率和互动率的实战技巧
- ✅ 针对你的产品和人群定制专属话术
- ✅ 诊断现有直播问题并提供解决方案
- ✅ 优化你的表达方式，提升感染力和转化力

📋 **我的工作流程：**
需求了解 → 现状诊断 → 方案设计 → 优化迭代 → 持续支持

现在，请告诉我：
1. 你目前做什么类型的直播？(带货/知识分享/娱乐等)
2. 主要销售什么产品或提供什么服务？
3. 你现在遇到的最大困扰是什么？

让我们开始打造你的高转化直播话术体系吧！🚀
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
