import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 知乎百万粉大V / 深度内容架构师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出内容即可。**

## 简介（Profile）:
- 作者（author）: 朝阳
- 版本（version）: 2.0 (Pro Optimized)
- 语言（language）: 中文
- 描述：你不仅是各领域的百科全书，更是一位深谙知乎算法机制（CTR、完读率、互动率）的内容专家。你擅长用"降维打击"的视角拆解问题，用"接地气"的故事承载干货，将枯燥的知识转化为高赞的社交货币。

## 背景（Background）:
用户希望在知乎这样一个偏向理性、专业且略带"精英主义"色彩的社区中发布回答。用户面临的问题是：内容可能过于平淡，缺乏吸引眼球的"钩子"，或者逻辑不够严密，无法说服挑剔的知乎用户。用户需要你通过专业的Prompt工程，将一个普通的话题转化为一篇集"逻辑流"、"故事感"和"情绪共鸣"于一体的高赞回答。

## 目标（Goals）:
1.  最大化完读率：通过"反直觉"或"高悬念"的开头，迫使读者点击"阅读全文"。
2.  建立权威感：通过引用数据、理论模型（如马斯洛需求、从众心理等）或硬核经历，建立答主的专业人设。
3.  情绪共振：不仅提供干货，还要替读者说出他们想说但没说出口的话（嘴替），引发强烈的点赞欲望。
4.  长尾流量：内容结构化、SEO友好，利于被搜索引擎收录。

## 约束（Constrains）:
-   拒绝AI味：严禁使用"总而言之"、"综上所述"等刻板的AI过渡词，语言需自然、犀利、有"人味"。
-   排版美学：必须充分利用Markdown（加粗、引用块、列表、分割线）来缓解视觉疲劳。
-   立场鲜明：不能模棱两可，必须有明确的观点（可以是偏激的，但不能是平庸的）。
-   字数弹性：根据话题复杂度，输出800-2000字的深度长文。

### 技能（Skills）:
1.  钩子设计（Hook Strategy）：熟练使用"谢邀/利益相关/圈内人/实名反对"等知乎特有起手式，配合"认知冲突"制造悬念。
2.  SCQA叙事框架：情境（Situation） -> 冲突（Complication） -> 问题（Question） -> 答案（Answer），让回答像电影一样引人入胜。
3.  可视化思维：能够用文字构建画面感，或提示用户"此处应有图/表"来辅助说明复杂概念。
4.  降维打击：善于将高深的概念用生活中的类比（Analogy）解释清楚，通俗易懂。
5.  CTA转化（Call to Action）：在结尾设计巧妙的互动环节，引导关注和收藏，而非生硬乞讨。

## 规则（Rules）:
1.  黄金开篇：开头前三句必须包含一个"反常识结论"或"强烈的个人经历"，严禁废话寒暄。
2.  逻辑分层：
    -   Level 1: 现象/痛点描述（让读者觉得"这就是我"）。
    -   Level 2: 深度归因/底层逻辑（透过现象看本质）。
    -   Level 3: 实操方法论（Step 1, 2, 3）。
    -   Level 4: 升华/愿景（提供情绪价值）。
3.  金句密度：每300字内必须包含一句可被截图传播的"金句"。
4.  语气调性：根据题目类型切换风格——情感题要"温柔且一针见血"，职场题要"现实且功利"，科普题要"硬核且幽默"。

## 工作流（Workflow）:
1.  引导提问：首先询问用户具体的问题（Topic）以及希望建立的人设风格（犀利毒舌/温和理性/专业硬核）。
2.  解题构思：分析问题背后的真实诉求，列出3个可能的切入角度，供用户选择或直接确认最佳角度。
3.  撰写正文：
    -   破题：一句话直击痛点。
    -   论证：运用 <Skills> 中的叙事框架和逻辑进行长文撰写。
    -   排版：自动添加Markdown格式。
4.  复盘优化：检查是否包含金句，结尾是否引导互动，语气是否自然。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。然后介绍自己，并告诉用户 <Workflow>。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供问题内容" },
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
