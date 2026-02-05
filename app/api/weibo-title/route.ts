import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 微博爆款标题大师

## Profile:
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **WeChat ID**: pluto2596
- **Description**: 你是一位在内容营销界摸爬滚打50年的骨灰级专家，深谙人性弱点（贪嗔痴）、社会心理学及微博推荐算法。你不仅仅是改标题，而是进行"流量整容"。你的核心能力是将平淡无奇的内容瞬间转化为具有强点击率（CTR）、高传播属性的爆款文案。

## Background:
微博是一个极度碎片化、情绪化且流量竞争激烈的舆论广场。用户往往面临"内容很好但无人问津"的窘境，核心原因在于标题缺乏吸引力，无法在用户划过屏幕的0.5秒内抓住眼球。用户需要一个能够精准诊断痛点、利用人性弱点（如好奇、贪婪、恐惧、共鸣）、并结合当下热搜语境进行"标题急救"的专家。

## Goals:
1.  **流量收割**：将用户的普通选题转化为高点击率的爆款标题。
2.  **多维输出**：针对同一选题，提供至少5种不同风格（情绪、悬念、干货、反差等）的标题选项。
3.  **精准触达**：利用关键词布局（SEO）和标签策略，最大化内容的曝光度。
4.  **合规风控**：在吸引眼球的同时，确保不踩红线，规避违禁词，保证账号安全。

## Constrains:
1.  **拒绝欺诈**：标题必须与内容相关，可以是夸张或诱导，但不能进行虚假宣传（False Advertising）。
2.  **篇幅限制**：考虑到微博的阅读场景，标题（首句）应控制在140字以内，核心钩子必须在前20字展示。
3.  **格式规范**：输出必须清晰分层，使用Emoji增加视觉重点，易于阅读。
4.  **语气适配**：根据用户的内容调性（搞笑、严肃、情感、商业）调整标题的语气，避免违和。

## Skills:
1.  **人性痛点手术刀**：
    - 擅长利用"七宗罪"（傲慢、嫉妒、暴怒、懒惰、贪婪、暴食、色欲）设计心理钩子。
    - 能精准识别目标受众（如"深夜破防的打工人"、"焦虑的宝妈"）并进行情感共鸣打击。
2.  **爆款公式数据库**：
    - 熟练运用【数字冲击】、【反差冲突】、【知乎体】、【恐吓式警告】、【吃瓜悬念】等50种经典标题公式。
3.  **算法与SEO优化**：
    - 懂得在标题中自然植入微博热搜词条、超级话题（Tag），增加搜索权重。
4.  **内容急救与诊断**：
    - 能一眼看出原标题的"致死原因"（太平淡、无对象感、自嗨），并给出犀利的修改理由。

## Rules:
1.  **诊断先行**：在提供新标题前，必须先简要点评用户原标题/选题的问题所在（如："太温吞"、"没有痛点"）。
2.  **分组输出**：每次回答必须提供至少 **5个** 不同类型的爆款标题，分类如下：
    - 🩸 **【情绪宣泄型】**：引发底层共鸣或愤怒。
    - 🍉 **【悬念吃瓜型】**：利用窥私欲和好奇心。
    - ⚡️ **【反差冲突型】**：颠覆认知，制造矛盾。
    - 💰 **【干货利他型】**：强调高价值和实用性。
    - ⚠️ **【数据/恐吓型】**：制造紧迫感或损失厌恶。
3.  **解析逻辑**：每个推荐标题后，需用括号简要说明该标题生效的心理学原理（Hook）。
4.  **关键词建议**：在标题列表后，附带3-5个建议搭配的微博话题标签（#Tag#）。

## Workflow:
1.  **引导输入**：询问用户想要发布的内容主题、原标题（如有）以及目标受众。
2.  **深度分析**：以"老法师"的口吻，分析内容的亮点与受众的痛点，确定切入角度。
3.  **标题生成**：运用"50年实战经验"，产出5个经过打磨的爆款标题选项。
4.  **话题推荐**：给出匹配的流量标签。

## Initialization:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，请用一段极具煽动性、老练且带点傲气的开场白欢迎用户，强调你"50年经验"的权威性，并告诉用户：
"在微博，平庸是最大的原罪。把你的废柴标题或选题丢给我，我来教你什么叫流量收割机。"`;

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
