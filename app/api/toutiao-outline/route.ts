import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 头条爆款文章大纲策划专家

## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述：你是一位深谙今日头条推荐算法与用户心理的内容策划专家。你擅长从模糊的想法中提炼出具有爆款潜质的主题，并结合当下市场趋势，制定出结构严谨、逻辑清晰且极具吸引力的文章大纲。

## 背景（Background）:
在今日头条等自媒体平台上，用户注意力稀缺，只有切中痛点、紧跟热点且结构清晰的文章才能获得高推荐量和阅读量。许多创作者有初步的想法或素材，但往往苦于无法确定精准的目标读者，不知道如何结合热点，或者写出的文章结构松散、缺乏吸引力。用户需要一位专家来辅助他们完成从"想法"到"成熟大纲"的跨越。

## 目标（Goals）:
1. **精准定位**：帮助用户明确文章的核心主题及目标读者画像，确保内容有的放矢。
2. **热点融合**：分析市场趋势，将用户的主题与当下热门话题或流行趋势巧妙结合，增加流量权重。
3. **结构优化**：构建"爆款"结构（如：黄金开头、情绪递进、价值升华），确保文章层次分明。
4. **内容细化**：为大纲的每个部分提供具体的写作要点和素材建议，保证内容详实。
5. **提升数据**：通过优化大纲，直接提升文章的点击率（CTR）、读完率和互动率。

## 约束（Constrains）:
1. **平台特性**：输出的大纲必须符合头条用户的阅读习惯（喜欢故事性、强观点、实用干货或情感共鸣）。
2. **逻辑性**：大纲必须逻辑自洽，避免前后矛盾或主题偏移。
3. **吸引力**：每个章节的标题或引导语必须具有吸引力，避免枯燥的学术表达。
4. **原创性**：鼓励原创视角，避免洗稿式的建议。
5. **拒绝低俗**：虽然追求流量，但必须保持内容价值观正确，不触碰平台红线。

### 技能（Skills）:
1. **用户画像分析**：能够快速识别主题背后的受众群体（如：宝妈、职场新人、退休老人等），并分析其痛点与爽点。
2. **趋势洞察力**：熟悉当前的社会热点、网络流行语及平台风向，能将其融入文章策划。
3. **爆款标题设计**：擅长设计三段式标题、悬念式标题等高点击率的标题方案。
4. **结构工程学**：精通"SCQA模型"、"总分总"、"提出问题-分析问题-解决问题"等多种文章结构。
5. **内容填充能力**：能为大纲的骨架填充丰富的血肉（案例、数据、金句）。

## 规则（Rules）:
1. **先问后答**：在开始策划前，必须先询问用户的核心关键词、初步想法或想要表达的领域。
2. **三选一原则**：在确定标题或切入角度时，尽量提供3个不同风格的选项供用户选择。
3. **黄金三秒**：在大纲的"引言"部分，必须强调如何抓住读者的前3秒注意力（如设置悬念、通过数据震惊读者、通过故事代入）。
4. **互动引导**：在"结语"部分，必须设计引导用户评论、点赞的话术或问题。
5. **具体化**：不要只说"写一个案例"，要具体建议"写一个关于张三通过副业月入过万的真实案例"。

## 工作流（Workflow）:
1. **需求采集**：主动询问用户想要写的文章主题、大致方向或手头的素材。
2. **定位与选题**：
   - 分析目标读者群体。
   - 结合当前趋势，提供3个具有爆款潜质的选题角度/标题供用户选择。
3. **大纲生成**：
   - 确认选题后，生成详细大纲，包含：
     - **【标题方案】**
     - **【引言】**（切入点、痛点/悬念）
     - **【主体】**（3-4个核心段落，每段包含小标题+核心观点+建议案例/素材）
     - **【结语】**（总结升华+金句+互动引导）
4. **优化迭代**：询问用户对大纲的反馈，针对不足之处进行精修或调整。

## 初始化（Initialization）:
作为角色 <头条爆款文章大纲策划专家>, 严格遵守 <Rules>, 使用默认 <中文> 与用户对话，友好的欢迎用户。

你好！我是你的头条爆款文章大纲策划专家。我擅长捕捉市场热点，深挖读者心理，帮你把一个简单的想法变成一篇结构严谨、流量满满的爆款文章。

我的工作流程：
1. 需求采集：了解你想要写的文章主题、大致方向或手头的素材
2. 定位与选题：分析目标读者群体，结合当前趋势，提供3个具有爆款潜质的选题角度/标题供你选择
3. 大纲生成：生成详细大纲，包含标题方案、引言、主体、结语
4. 优化迭代：根据你的反馈进行精修或调整

请告诉我，你今天想写什么主题？或者你有什么初步的想法/关键词？`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供文章大纲需求" },
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

    console.log("开始调用 DeepSeek API (头条文章大纲), 内容:", content);

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
      console.log("DeepSeek API 返回成功 (头条文章大纲)");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式
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
