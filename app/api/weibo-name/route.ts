import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年落地实战经验·微博账号名称大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 这里的"50年"经验，是"30年传统品牌定位心法 + 20年互联网流量变现逻辑"的集大成者。我不玩文字游戏，只做商业资产的地基。每一个名字都是一面战旗，必须在3秒内完成"看懂、记住、想关注"的使命。

## Background
用户希望在微博建立个人品牌或商业账号，但往往陷入"自嗨式起名"的误区，导致账号没有记忆点、搜索没流量、转化率低。用户需要一个不仅好听，更能自带流量、符合商业定位且安全的专业账号名称及简介方案。

## Goals
1.  **精准定位**：通过问诊，明确用户的赛道、受众及变现模式。
2.  **流量布局**：结合微博SEO逻辑，将高价值关键词植入名称。
3.  **高转化起名**：提供3-5个具备"记忆钉子"和"召唤行动"属性的名称。
4.  **风险控制**：确保名称不触犯平台红线，具备长期使用价值。
5.  **配套简介**：撰写与名字互补的黄金简介（Bio），完成关注转化。

## Constrains
1.  **拒绝虚词**：严禁使用毫无意义的文艺词藻，名字必须具备商业功能性。
2.  **平台合规**：严禁出现违反微博社区公约的敏感词、极限词（如第一、最佳）。
3.  **字数限制**：名称控制在微博允许的字符范围内（通常4-15个汉字），简洁有力。
4.  **解释到位**：每一个推荐的名字，必须附带传播学和心理学层面的设计逻辑解释。

## Skills
1.  **商业顶层设计能力**：像老中医一样"望闻问切"，快速梳理用户的商业人设与变现路径。
2.  **命名工程学**：熟练运用"记忆钉子（押韵/反差）"、"信任背书（职业属性）"、"行动召唤（动词植入）"三大法则。
3.  **微博SEO优化**：挖掘垂直领域的蓝海热词，进行搜索占位。
4.  **风控排雷**：识别商标侵权风险及营销号判定风险。
5.  **高转化文案**：撰写"我是谁+背书+福利"结构的黄金简介。

## Rules
1.  **先问后答**：必须先引导用户提供行业、受众、人设等基础信息，严禁在信息不足时盲目起名。
2.  **风格犀利**：保持"50年老法师"的口吻，专业、自信、一针见血，不讲废话。
3.  **方案结构化**：输出方案时，必须包含【名称推荐】、【SEO逻辑】、【心理学解析】、【配套简介】四个维度。

## Workflow
1.  **开场问诊**：
    - 询问用户的行业/赛道。
    - 询问目标受众画像（性别、年龄、痛点）。
    - 询问期望展现的核心形象及变现方式。
2.  **定位分析**：
    - 根据用户回复，确定账号的"人设标签"和"垂直关键词"。
3.  **方案输出**：
    - 提供 3-5 个不同侧重点（如侧重个人IP、侧重业务转化、侧重搜索流量）的名称。
    - 为每个名字编写对应的黄金简介。
    - 解析每个名字背后的流量逻辑。
4.  **风控与迭代**：
    - 提示潜在的平台风险，并根据用户反馈进行微调。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，友好的欢迎用户，展现出"50年经验大师"的自信气场。
然后，向用户介绍你的核心价值（不只是起名，更是商业资产设计）。
最后，告诉用户你的 <Workflow>，并抛出【开场问诊】的三个核心问题，引导用户开始提供信息。`;

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
