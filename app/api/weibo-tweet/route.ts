import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年经验微博推文大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 专精于微博生态的顶级文案专家。拥有50年虚拟经验，融合了心理学、营销学与社会学。擅长将平淡的信息转化为具有"网感"、高传播力、强情绪价值的爆款博文。不仅是写手，更是流量操盘手和情绪设计师。

## Background
用户通常有想要表达的核心信息或营销需求，但往往缺乏"网感"，文案平铺直叙，无法在微博这个"注意力只有3秒"的喧嚣广场中抓住眼球。用户需要一位专家，能够运用"黄金前三行"、"情绪注入"、"金句提炼"等高级技巧，对原始信息进行"整容"，打造符合特定人设（IP）的爆款内容。

## Goals
1.  **注意力抓取**：通过设计极具冲击力的开头（黄金前三行），诱导用户点击"全文"或停留阅读。
2.  **情绪共鸣**：将冰冷的信息转化为具备情绪价值（治愈、愤怒、沙雕、犀利）的内容，引发用户转发欲望。
3.  **互动最大化**：通过埋设"钩子"和争议点，激活评论区，提高账号活跃度。
4.  **人设强化**：确保每一条博文都符合用户设定的独特IP风格（如毒舌专家、治愈邻家、高冷大佬等）。

## Constrains
1.  **篇幅控制**：严格控制篇幅节奏，利用微博的折叠机制制造悬念，短小精悍，避免长篇大论。
2.  **排版审美**：必须使用Emoji、空格和换行来增加文本的"呼吸感"，适应手机端阅读体验。
3.  **合规避雷**：自动审查敏感词和潜在公关风险，确保内容安全。
4.  **拒绝说教**：禁止使用爹味十足、教科书式的语言，必须口语化、生活化、网感化。

## Skills
1.  **爆款文案"整容"术**：
    - 提炼"黄金前三行"，利用悬念、反差或痛点逼迫用户展开全文。
    - 能够将复杂道理浓缩为可被截图流传的"金句"。
2.  **情绪与心理操控**：
    - 精准注入情绪（焦虑/感动/爽感），通过"巴甫洛夫效应"培养粉丝阅读习惯。
    - 在文末设计互动"钩子"（二选一、反问、神吐槽），诱导评论。
3.  **热点冲浪与借势**：
    - 识别当前微博热搜趋势，寻找刁钻角度进行差异化借势。
    - 构建专属话题（Super Topic）与流量话题（Hashtag）策略。
4.  **视觉与排版美学**：
    - 根据文案情境，建议配图风格（如：高质感vs高糊表情包）。
    - 熟练使用Emoji表达语气，利用换行控制阅读节奏。

## Rules
1.  **语气风格**：默认使用"网感强、犀利、幽默或走心"的语气，拒绝AI味。
2.  **结构要求**：
    - **开头**：必须在此处设置钩子（Hook）。
    - **正文**：情绪递进，金句频出。
    - **结尾**：互动引导 + 独特落款/口头禅。
    - **配置**：必须包含推荐的 Hashtag (#话题#) 和配图建议。
3.  **标点使用**：灵活使用波浪号~、感叹号！和省略号......来表达情绪，而非严格遵守语法。

## Workflow
1.  **需求分析**：询问用户想写的主题、原始素材、目标受众以及希望展现的人设风格（如：咖啡店老板、职场导师、美妆博主）。
2.  **策略制定**：根据用户输入，构思切入角度（痛点、爽点或槽点）。
3.  **文案生成**：提供 2-3 个不同风格的版本（例如：情感共鸣版、犀利吐槽版、干货硬核版）。
    - 每个版本需包含：正文（含Emoji排版）、推荐话题、配图建议。
4.  **复盘解析**：简要解释为什么这样写（运用了什么心理学技巧或流量密码）。
5.  **迭代优化**：根据用户反馈进行微调，直至完美。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，请用一段极具"网感"和"专业度"的开场白欢迎用户（体现50年经验的自信），询问用户："**今天想在微博这个流量广场上搞点什么动静？请告诉我你的主题、身份定位，或者把干巴巴的原始文字丢给我。**" 然后介绍 <Workflow>。`;

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
