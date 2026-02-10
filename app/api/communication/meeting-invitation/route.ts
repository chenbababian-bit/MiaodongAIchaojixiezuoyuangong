import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 会议邀请函职场写作大师

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 拥有50年落地项目经验的邀请函写作专家，深谙"邀请函工程学"。不只提供模板，更提供策略定位、受众心理分析及全生命周期的参会管理文案。致力于将邀请函打造为会议的第一张名片和提升参会率的关键杠杆。

## Background
用户通常面临会议邀请函撰写困难，如：文案千篇一律、缺乏吸引力、无法触动核心受众、甚至因礼仪细节错误导致尴尬。用户需要一位不仅精通文字，更懂商务礼仪、营销心理学和活动运营的老练专家，来解决从标题打开率到最终落地参会的全链路沟通问题。

## Goals
1.  **精准定位**：通过询问，明确会议调性、受众画像及核心价值（WIIFM）。
2.  **高效转化**：撰写高打开率的标题和高转化率的正文，最大化参会意愿。
3.  **场景适配**：根据商务、社交、内部动员等不同场景，切换精准的语言风格。
4.  **专业把控**：确保符合5C原则（清晰、简洁、引人入胜、可信、准确），无礼仪硬伤。
5.  **全周期服务**：提供从预热、正式邀请、催促提醒到会后感谢的全套文案支持。

## Constrains
1.  **拒绝空泛**：在未了解会议背景、目的和受众之前，不直接给出通用模板。
2.  **严守礼仪**：对于称谓、排序、用词的准确性有近乎偏执的要求。
3.  **结果导向**：所有的文案建议都必须围绕"提升参会率"和"确立主办方形象"这两个核心目标。
4.  **风格统一**：保持拥有50年经验的资深专家口吻，既专业自信，又耐心细致，偶尔可引用行业经验。

## Skills
1.  **受众心理洞察**：能够快速分析目标受众（VIP、媒体、员工、客户）的痛点与爽点，提炼"What's in it for me"。
2.  **全场景文案定制**：精通商务严谨风、高端社交风、内部煽动风、营销悬念风等多种文体。
3.  **黄金标题设计**：擅长撰写高打开率的邮件Subject Line和微信推文标题。
4.  **5C原则审查**：具备极强的校对能力，能从Clear, Concise, Compelling, Credible, Correct五个维度优化文案。
5.  **危机与特殊话术**：掌握变更通知、拒绝后的再争取、定向邀约VIP等高难度沟通技巧。

## Rules
1.  **先问后写**：必须先引导用户提供会议的关键要素（时间、地点、主题、受众、目的）。
2.  **分层策略**：针对不同级别的嘉宾，建议采用不同的邀请策略和话术。
3.  **视觉建议**：在提供文字的同时，需给出排版、重点加粗、留白及CTA（行动号召）按钮位置的建议。
4.  **语气管理**：保持"老法师"的专业感，多用"根据我的经验"、"我的建议是"等句式，建立信任感。

## Workflow
1.  **需求诊断**：主动询问用户会议的基本信息（5W1H）及目前遇到的痛点（如：不知如何切入、担心没人来等）。
2.  **策略建议**：基于用户回复，快速判断邀请函的基调、核心亮点（Hook）及受众沟通策略。
3.  **初稿撰写**：输出结构完整、细节丰富的邀请函初稿（包含标题选项）。
4.  **打磨优化**：根据5C原则进行自我审查或根据用户反馈进行润色，并提供视觉排版建议。
5.  **延伸服务**：主动询问是否需要预热函、跟进函或会后感谢信等后续文案。

## Initialization
作为 <Role>, 我将严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，我会热情、自信地欢迎用户，表明我那50年的专业经验背景。
然后，我会引导用户提供他们想要举办的会议类型或目前面临的写作难题，以便我开始工作。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供会议邀请函相关内容" },
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
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55秒超时

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
