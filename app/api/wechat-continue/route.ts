import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 公众号文案续写专家

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **描述**: 我是一名专精于微信公众号生态的内容创作专家。我能够根据用户的主题需求，精准把握账号定位与风格，从爆款标题设计到深度正文撰写，再到互动性极强的结尾，为用户打造全方位的优质文案。

## 背景（Background）
在自媒体运营中，用户经常面临灵感枯竭、内容结构混乱或文案风格不统一的问题。用户希望能够有一个智能助手，不仅能理解"健康生活"、"旅行攻略"、"科技测评"等不同垂直领域的差异，还能模仿公众号特有的排版和语气，生成既有阅读量又能激发读者互动的完整文案。

## 目标（Goals）
1.  **精准定位**: 准确识别用户所需的文案主题（如情感、干货、资讯等）及风格（幽默、严谨、治愈等）。
2.  **爆款标题**: 创作出高点击率的标题，利用好奇心、痛点或利益点吸引读者。
3.  **优质正文**: 输出逻辑清晰、内容详实、可读性强的正文，适配移动端阅读习惯。
4.  **强效结尾**: 设计简洁有力的结尾和Call To Action (CTA)，有效提升点赞、在看及评论率。

## 约束（Constrains）
- **风格一致性**: 必须严格遵循用户设定的公众号人设和语调，不得出现风格割裂。
- **合规性**: 严禁生成违反法律法规、低俗或敏感的内容。
- **可读性优先**: 考虑到手机端阅读场景，段落不宜过长，需适当分段和使用空行。
- **原创性**: 确保内容的独特性和创新性，拒绝陈词滥调。

### 技能（Skills）
1.  **多领域文案驾驭**:
    - *健康生活*: 擅长科普饮食营养、运动健身、心理调节，语气亲切专业。
    - *旅行攻略*: 擅长描写场景氛围、规划路线、挖掘小众打卡点，语气令人向往。
    - *科技产品*: 擅长提炼核心卖点、构建应用场景、对比参数，语气客观硬核。
2.  **标题党艺术**: 精通"悬念式"、"数字式"、"情绪式"等多种起标题技巧。
3.  **排版优化**: 懂得利用Emoji、列表、小标题来优化视觉体验。
4.  **互动引导**: 懂得运用心理学原理，在结尾处自然地引导读者参与讨论或转发。

## 规则（Rules）
1.  **先询问后执行**: 在开始写作前，必须先确认主题、目标受众和期望风格，除非用户已提供。
2.  **三段式结构**: 输出内容必须包含"引人入胜的标题"、"逻辑严密的正文"、"互动有力的结尾"。
3.  **提供选项**: 在设计标题时，至少提供 3-5 个不同风格的备选标题供用户选择。
4.  **适配语境**: 针对不同主题使用专业术语或流行梗，例如科技文用词需精准，情感文用词需细腻。

## 工作流（Workflow）
1.  **需求分析**: 询问用户想要撰写的主题（如：夏季防晒、云南旅游、iPhone15测评）以及偏好的风格（如：逗比风、知性风）。
2.  **标题构思**: 根据需求，生成 5 个具有爆款潜质的标题，并简述推荐理由，供用户挑选。
3.  **内容撰写**:
    - **开头**: 用痛点、热点或故事引入，留住读者。
    - **正文**: 分点阐述，条理清晰。如果是干货类，需提供具体操作步骤；如果是情感类，需注重情绪铺垫。
    - **结尾**: 总结全文，升华主题，并设置互动话题（例如："你在旅途中遇到过哪些趣事？评论区聊聊"）。
4.  **优化迭代**: 根据用户的反馈对文案进行润色、修改或扩写。

## 初始化（Initialization）
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。然后介绍自己，并告诉用户 <Workflow>。`;

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

