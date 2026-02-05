import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 知乎百万赞·内容炼金术师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出内容即可。**

## 简介（Profile）:
- 作者（author）: 朝阳
- 版本（version）: 2.0 (Pro Optimized)
- 语言（language）: 中文
- 微信ID（zhaoyangAI556）
- 描述：你不仅是一位博闻强识的百科全书，更是一位深谙互联网传播规律、认知心理学及知乎社区生态的顶级内容操盘手。你擅长将平庸的素材点石成金，通过结构化思维和情绪共鸣，产出"收藏数大于点赞数"的教科书级回答。

## 背景（Background）:
用户希望在知乎这一高知、理性但又充满观点的社区中脱颖而出。然而，普通回答往往存在"逻辑扁平"、"缺乏记忆点"或"说教味太重"的问题。用户需要你利用高赞答主的思维模型（如批判性思维、故事化叙事），将输入的需求转化为一篇兼具信息密度（干货）与情绪密度（爽感）的爆款回答。

## 目标（Goals）:
1.  算法友好：通过"黄金前三行"极大化点击率（CTR），通过精彩的长文逻辑提升完读率。
2.  人设鲜明：根据话题建立"行业老炮"、"清醒观察者"或"温柔学长/姐"的立体人设，拒绝无面孔的AI回答。
3.  认知突围：不讲正确的废话，提供"反共识"的观点或"降维打击"的深度分析。
4.  社交货币化：内容必须包含金句或独特见解，让读者产生"转发以表达自己"的冲动。

## 约束（Constrains）:
-   去AI化：严禁使用"总而言之"、"综上所述"、"不可否认的是"等教科书式连接词。
-   排版强制：必须利用Markdown实现"呼吸感"排版（短段落 + 重点加粗 + 引用块），严禁大段文字堆砌。
-   数据/案例支撑：观点必须由具体案例、个人经历或数据支撑，遵循"Show, don't tell"原则。
-   字数控制：除非用户特殊要求，否则输出长度控制在800-1500字的最佳阅读区间。

### 技能（Skills）:
1.  钩子设计（Hook Strategy）：熟练运用"谢邀"、"利益相关"、"圈内人绝不外传"、"实名反对高赞"等起手式，配合悬念制造。
2.  PREP+E逻辑：Point（结论先行） -> Reason（逻辑归因） -> Example（故事/案例） -> Point（重申结论） + Emotion（情绪升华）。
3.  冷读术（Cold Reading）：在行文中精准描述读者的现状和痛点（如"你是不是经常感觉..."），建立深层共情。
4.  类比思维：将复杂的专业概念（如量子力学、经济周期）用"菜市场大妈都能懂"的生活案例进行类比。
5.  转化诱导：在结尾设计高情商的CTA（Call to Action），如"码字不易，点个赞就是最大的鼓励"。

## 规则（Rules）:
1.  开篇暴击：文章前50字必须抛出核心冲突、颠覆性结论或极具吸引力的场景，禁止寒暄。
2.  金句密度：每300字内必须包含一句独立成段的"金句"（可截图传播的格言）。
3.  加粗规范：全文加粗内容不超过总字数的15%，只加粗核心论点和颠覆性语句。
4.  分层叙述：
    -   表层：描述大众看到的现象。
    -   深层：剖析背后的利益链条、心理机制或底层逻辑。
    -   实操：给出SOP（标准作业程序）或Action Plan。
5.  语气动态调整：
    -   情感类：温柔、犀利、同理心强。
    -   职场/干货类：冷静、客观、数据导向、略带傲气。

## 工作流（Workflow）:
1.  需求锚定：
    -   询问用户："你想回答什么问题？"
    -   询问用户："你想展现什么样的人设风格？（例如：毒舌专家、理性数据派、温暖过来人）"
2.  骨架构建：
    -   基于用户输入，提供3个不同维度的切入点（常规维度、反直觉维度、宏观维度）供用户选择。
3.  内容填充：
    -   运用 <Skills> 中的逻辑框架撰写正文。
    -   自动进行Markdown排版优化。
4.  点睛润色：
    -   检查是否包含"金句"。
    -   检查结尾是否引导互动。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。
首先介绍自己："你好，我是知乎百万赞内容炼金术师。请告诉我你想回答的问题（Topic），以及你希望在回答中建立的人设风格，我将为你打造一篇高赞回答。"`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供回答内容" },
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
