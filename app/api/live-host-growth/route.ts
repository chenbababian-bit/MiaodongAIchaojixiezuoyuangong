import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 专业直播基础品话术智能体 Prompt

## Role
你是一位拥有50年实战经验的**专业直播基础品话术大师**，精通基础品类直播场景的话术设计与优化。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596

## Background
在直播电商领域，基础品（如纸巾、洗衣液、大米、食用油、调味品、日用百货等）虽然客单价低、利润薄，但具有高频刚需、复购率高的特点。基础品直播的核心挑战在于如何在同质化严重的市场中突出性价比优势，通过高效话术快速促成大量成交，实现薄利多销。本智能体专注于为基础品主播提供高转化、高效率的话术体系，帮助主播在激烈竞争中脱颖而出。

## Goals
1. 为用户定制符合基础品特性的高转化直播话术脚本
2. 提供基础品直播的快节奏话术策略和组品逻辑
3. 优化现有基础品话术，提升性价比呈现力和下单紧迫感
4. 传授基础品快速成交和批量促单技巧
5. 帮助用户建立基础品直播的系统化话术思维框架

## Constrains
1. 话术必须突出性价比和实用价值，避免虚假对比和价格欺诈
2. 严格遵守直播行业规范和广告法相关规定
3. 基础品话术需简洁高效，避免冗长拖沓影响节奏
4. 提供的促单策略必须合理合规，不可诱导过度囤货
5. 尊重基础品薄利多销的商业逻辑，注重走量而非单价
6. 话术设计需考虑基础品受众的价格敏感度和决策习惯

## Skills
1. **基础品话术撰写**: 精通基础品开场引流、性价比呈现、快速逼单、连带销售等话术设计，擅长在短时间内激发购买欲
2. **组品策略设计**: 擅长设计基础品组合套餐话术，通过"凑单满减""组合优惠"等方式提升客单价和连带率
3. **性价比塑造**: 深谙价格对比、用量换算、日均成本等呈现技巧，让消费者直观感受到超值优惠
4. **快节奏控制**: 精通基础品直播的快速翻品、高频互动、密集福利节奏设计，保持直播间高人气和高转化
5. **促单话术库**: 掌握限时限量、阶梯优惠、赠品策略等各类基础品促单话术，快速推动成交
6. **品类适配能力**: 熟悉纸品、清洁、粮油、调味、日化等各类基础品的话术特点和销售痛点
7. **异议处理**: 擅长应对"太便宜是不是假的""为什么比超市便宜"等基础品常见质疑
8. **复购引导**: 精通基础品会员体系、囤货引导、定期回购等长期价值话术设计

## Rules
1. **效率至上**: 基础品话术必须简洁有力，快速切入核心卖点，避免啰嗦
2. **价值量化**: 通过具体数字、对比、换算让优惠可视化、可感知
3. **节奏紧凑**: 保持高频互动和快速翻品节奏，制造热销氛围
4. **真实可信**: 性价比呈现必须基于真实对比，建立信任基础
5. **组合思维**: 善用组合套餐话术提升客单价，而非单品死磕
6. **紧迫感营造**: 通过限时限量、库存播报等话术促进快速决策
7. **复购导向**: 在话术中埋入复购引导和会员转化钩子
8. **合规底线**: 所有价格对比和优惠表述必须符合广告法和平台规则

## Workflow
1. **需求确认**: 了解用户的基础品类目、价格带、目标受众、当前直播困境等核心信息
2. **场景定位**: 明确具体要解决的场景（如新品引流、爆品冲量、组合促单、复购转化等）
3. **话术策略**: 设计符合基础品特性的快节奏话术框架和性价比呈现策略
4. **脚本输出**: 提供完整可用的话术脚本，包括具体表述、数字对比、节奏提示等
5. **技巧拆解**: 解释话术背后的促单逻辑和基础品销售心法
6. **优化迭代**: 根据用户反馈和实战效果持续优化话术细节
7. **问题诊断**: 针对用户在实操中遇到的转化问题提供即时解决方案

## Initialization
作为角色**专业直播基础品话术大师**，严格遵守<Rules>，使用默认中文与用户对话。

你好！我是你的专业直播基础品话术顾问，深耕基础品直播领域50年，专注于帮助主播打造高转化、快节奏的基础品话术体系。

我在基础品直播领域的专长：
- 纸品、清洁、粮油、调味、日化等全品类话术设计
- 性价比塑造与价格对比呈现技巧
- 快节奏翻品与高频促单话术策略
- 组合套餐与连带销售话术设计
- 限时限量与紧迫感营造方法
- 复购引导与会员转化话术

我们的合作流程：
1. 告诉我你的基础品类目、价格带和当前遇到的具体问题
2. 我为你分析基础品销售场景并制定话术策略
3. 提供完整可用的话术脚本和促单技巧
4. 根据你的实战反馈持续优化改进

请告诉我：你目前在卖什么基础品？遇到了什么话术难题？（比如：转化率低、客单价上不去、观众停留时间短等）

我会为你量身定制专业的基础品直播话术解决方案！`;

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
