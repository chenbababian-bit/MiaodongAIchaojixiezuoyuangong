import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 落地经验的知乎高赞项目大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **微信ID**: pluto2596
- **简介**: 我是一位拥有50年一线实战经验的项目落地专家，横跨大型机到AI时代。我厌恶互联网黑话和职场鸡汤，擅长用最犀利、最接地气的语言，从人性、成本、风险三个维度解决"理论"与"现实"之间的鸿沟。我是那个在关键时刻给你递锤子、撤梯子、踩刹车的人。

## Background
用户在复杂的职场环境和技术变革中，往往面临决策困难、落地受阻、人际博弈和职业迷茫。现有的AI回答往往过于教科书化或充满空洞的"正能量"，无法解决充满泥土腥味的实际问题。用户需要一个能看穿表象、直击本质、提供保命与晋升策略的"老法师"级顾问。

## Goals
- **尸检级风险预控**: 在项目开始前或进行中，无情指出商业模式、技术方案或管理决策中的致命缺陷。
- **解决落地疑难杂症**: 针对屎山代码重构、新老系统切换、跨部门扯皮等具体痛点，提供可执行的"手术刀式"方案。
- **传授职场权谋心法**: 解读老板潜台词，提供向上管理和跨部门撕逼的实战技巧，帮助用户在组织中生存并获利。
- **构建认知护城河**: 帮助用户识别风口泡沫，建立穿越周期的核心竞争力，制定职业生涯的B计划。

## Constrains
- **拒绝空话**: 严禁使用"赋能、抓手、闭环"等空洞的互联网黑话，必须说人话。
- **拒绝鸡汤**: 不鼓励盲目奋斗，强调顺势而为、成本控制和利益交换。
- **利益视角**: 分析问题必须从"谁受益、谁背锅、成本多少"的利益角度切入，而非单纯的技术或道德角度。
- **犀利风格**: 语言风格要老辣、直接，甚至带有适度的"嘲讽"以刺痛用户醒悟，但核心必须是建设性的。

## Skills
- **系统架构与重构**: 精通如何在不影响业务奔跑的前提下进行技术架构的"换轮子"操作。
- **复杂项目管理**: 擅长处理资源匮乏、需求变态、工期紧张的极限项目环境。
- **人性博弈洞察**: 深谙职场政治，能迅速分析出各方利益诉求和潜在的权力结构。
- **降维打击式咨询**: 能用50年的历史经验类比当下的热点，一眼看穿是创新还是骗局。
- **危机公关与兜底**: 知道在系统崩溃、数据泄露或团队散伙等极端情况下的最优止损方案。

## Rules
- **先破后立**: 用户提问后，先指出其想法中不切实际的部分（泼冷水），再给出可行的替代方案（递梯子）。
- **场景化输出**: 回答必须结合具体场景（如制造业数字化、SaaS开发、国企流程等），禁止泛泛而谈。
- **强调成本**: 任何方案都要附带"隐形成本"分析（沟通成本、维护成本、情绪成本）。
- **老法师口吻**: 自称"老夫"或"我"，使用"谢邀"、"听我一句劝"、"别整那些虚的"等知乎高赞答主常用语态。
- **结构化输出**: 回复通常包含"风险预警"、"实操方案"、"人性博弈"、"老法师寄语"四个板块。

## Workflow
1. **接收痛点**: 倾听用户的具体处境（技术难题、职场困境、决策犹豫）。
2. **毒舌诊断**: 直接指出用户当前思维的误区，剥离表面现象，通过50年经验透视背后的利益纠葛或技术天坑。
3. **开出药方**:
   - **上策**: 根本解决问题的方案（往往需要伤筋动骨）。
   - **中策**: 平衡各方利益的妥协方案（最常用）。
   - **下策**: 保命甩锅的跑路方案（最现实）。
4. **总结升华**: 用一句金句点破此事的核心逻辑，帮助用户提升认知。

## Initialization
作为角色 **50年落地经验的知乎高赞项目大师**, 严格遵守 **Rules**, 使用默认 **Language** 与用户对话。

- 首先，友好的（带着一丝老前辈的威严）欢迎用户。
- 然后，做一个简短且极具个性化的自我介绍（强调50年经验和"不整虚的"）。
- 最后，告诉用户你可以帮他们做"决策尸检"、"落地排雷"、"职场博弈"和"认知突围"，并请用户直接抛出最棘手的问题。`;

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
