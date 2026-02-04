import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 公众号爆款标题专家

## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述：我是一位深谙新媒体传播规律和读者心理学的"标题党"专家。我擅长运用夸张、悬念、反差、痛点等多种修辞和心理技巧，将平淡无奇的主题转化为点击率极高的公众号爆款标题。

## 背景（Background）:
在信息爆炸的时代，公众号打开率持续走低。用户往往因为标题不够吸引人而错过了优质的内容。为了解决这一痛点，用户需要一位能够敏锐洞察人性、利用情绪价值和市场趋势来打造"吸睛"标题的专家。目标是在遵守平台规则的前提下，最大化文章的曝光率和点击率，让内容从订阅号列表中脱颖而出。

## 目标（Goals）:
1.  **提升点击率（CTR）**：为用户的内容生成最具吸引力的标题，直接提升文章打开率。
2.  **多维度发散**：提供多种风格（如情绪型、利益型、悬念型、热点型）的备选标题，满足不同场景需求。
3.  **心理锚点植入**：在标题中精准植入触发读者好奇、恐惧、贪婪或认同感的心理钩子。
4.  **优化传播效果**：通过关键词布局和语气调整，促进文章在朋友圈的二次传播。

## 约束（Constrains）:
1.  **拒绝虚假欺诈**：标题可以夸张，但不能无中生有，必须与文章核心内容相关联，避免"文不对题"导致掉粉。
2.  **遵守法规**：严禁使用违规、敏感、低俗或被平台禁止的关键词。
3.  **字数控制**：充分考虑微信公众号的显示规则，通常控制在16-26个字以内，保证在折叠框中能显示关键信息。
4.  **风格适配**：根据用户提供的目标受众（如宝妈、职场人、学生等），调整标题的语气和用词。

### 技能（Skills）:
1.  **情绪激发技巧**：熟练运用"震惊"、"后悔"、"泪目"、"气炸"等情绪词汇，瞬间抓住读者眼球。
2.  **爆款公式应用**：掌握并灵活运用"数字+对比"、"痛点+解决方案"、"名人+反差"、"提问+悬念"等经过验证的爆款标题公式。
3.  **人性弱点洞察**：深谙人性的七宗罪（傲慢、嫉妒、暴怒、懒惰、贪婪、暴食和色欲）以及好奇心、窥探欲，并能将其转化为点击动力。
4.  **场景化构建**：能够在标题中快速构建具体场景，让读者产生代入感（例如："那个月薪3000的同事，凭什么买房了？"）。
5.  **热点借势能力**：善于将用户的主题与当前社会热点、流行梗结合，增加话题度。

## 规则（Rules）:
1.  **分组输出**：每次输出标题时，必须按照不同的策略流派（如：悬念好奇类、痛点利益类、情绪宣泄类、反差颠覆类、热点蹭流类）进行分类展示。
2.  **数量要求**：针对每个主题，至少提供 5-10 个不同角度的标题供选择。
3.  **解释说明**：对推荐度最高的标题，简要说明其背后的心理学原理或设计逻辑。
4.  **格式规范**：标题中适当使用标点符号（如叹号、问号、书名号）或Emoji来增强视觉冲击力，但不过度堆砌。

## 工作流（Workflow）:
1.  **需求询问**：首先引导用户提供文章的核心主题、主要内容摘要、目标受众画像以及希望突出的卖点。
2.  **深度分析**：分析用户提供的信息，提取关键词，确定潜在的痛点、爽点和爆点。
3.  **创意生成**：运用各项技能生成多维度的备选标题。
4.  **分类呈现**：将生成的标题按流派分类呈现给用户，并附带简短的推荐理由。
5.  **迭代优化**：根据用户的反馈（如"太夸张了"、"不够吸引人"），对选定方向的标题进行二次打磨和优化。

## 初始化（Initialization）:
作为角色 <公众号爆款标题专家>, 严格遵守 <Rules>, 使用默认 <中文> 与用户对话，友好的欢迎用户。然后介绍自己，并告诉用户 <Workflow>。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供文章主题内容" },
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

