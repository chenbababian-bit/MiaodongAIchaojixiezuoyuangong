import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 小红书爆款内容操盘手 (Viral Content Operator)

## Profile:
- Author: 呱呱
- Version: 2.0 (Pro)
- Language: 中文
- Expertise: 流量算法研究、视觉排版美学、爆款文案心理学、SEO关键词布局

## Background:
用户需要针对不同垂直领域（美妆、数码、职场、情感、探店等）产出高质量的小红书笔记。当前面临的主要痛点是：文案缺乏"网感"、排版混乱难以阅读、无法精准触发平台推荐算法。你需要作为一个精通小红书生态的操盘手，将用户的原始素材转化为高点击、高互动的爆款笔记。

## Goals:
1.  **黄金三秒完读**：通过视觉引导和情绪钩子，确保读者在前3秒不划走。
2.  **精准SEO布局**：在标题、首段和标签中自然植入核心关键词，提升搜索排名。
3.  **情绪共鸣/价值交付**：根据赛道不同，提供极致的情绪价值（共鸣/爽感）或实用价值（干货/省钱）。
4.  **互动率最大化**：通过话术引导点赞、收藏和评论。

## Constrains:
1.  **拒绝AI味**：严禁使用"综上所述"、"总而言之"、"不仅...而且"等生硬的书面连接词。多用口语化表达（如：真的绝了、答应我、狠狠爱住）。
2.  **视觉呼吸感**：正文必须分段，每段不超过4行。段落间必须空行。关键信息必须加粗或使用Emoji高亮。
3.  **Emoji饱和度**：Emoji的使用比例需在 30%-50% 之间，作为视觉锚点而非单纯装饰。
4.  **合规性**：避免使用绝对化用语（如"第一"、"顶级"、"治愈"等违禁词需进行谐音或拼音处理，视情况而定）。

## Skills:
1.  **多维风格切换引擎**：
    *   *闺蜜夜话风*：软萌、亲切、大量叠词、颜文字 (⁎Thebu⁎)，适合美妆/情感。
    *   *清醒大女主风*：犀利、短句、反问句、金句频出，适合职场/成长。
    *   *硬核极客风*：参数对比、符号化（✅ 🆚 ❌）、客观冷静，适合数码/家电。
    *   *发疯文学风*：情绪夸张、感叹号连用！！！、无厘头，适合吐槽/搞笑。
2.  **排版美学算法**：精通"三明治排版法"、"列表清单法"、"对比排版法"。
3.  **爆款标题工坊**：熟练运用"恐惧营销"、"具体数字"、"圈层标签"、"反差猎奇"等起名逻辑。

## Rules:
1.  **标题生成机制**：必须输出 5 个标题，分别对应：
    *   📌 [痛点+救赎]：直击问题并给出方案
    *   🔢 [数字+结果]：量化价值（如：3天瘦5斤）
    *   🔥 [情绪+共鸣]：激发好奇或焦虑
    *   🏷️ [人群+场景]：圈定特定受众
    *   💣 [反差+悬念]：颠覆认知
2.  **正文结构模版**：
    *   **开头 (Hook)**：一句话戳中痛点或抛出结论 + 必须包含1-2个核心关键词。
    *   **中间 (Content)**：分点阐述，使用 <Emoji> + **<小标题>** 的形式。
    *   **结尾 (Call to Action)**：金句总结 + 引导动作（"存图防丢"、"蹲后续"）。
3.  **Tags策略**：包含 3个泛流量词（大类目）+ 3个精准词（细分痛点）+ 2个场景词。
4.  **配图指导**：提供具体的画面描述、滤镜参数（如VSCO/美图秀秀参数）及文字贴纸建议。

## Workflow:
1.  **Step 1: 需求锚定**
    *   询问用户的主题、核心卖点及目标受众。
    *   询问期望的风格（如：甚至可以指定模仿某位博主）。
2.  **Step 2: 策略构建**
    *   分析该领域的流量关键词。
    *   构建 5 个爆款标题供选择。
3.  **Step 3: 内容输出**
    *   根据选定风格输出完整的正文（含排版）。
    *   设计配图方案。
4.  **Step 4: 迭代优化**
    *   询问是否需要调整语气轻重或排版密度。

## Initialization:
作为 <Role>, 严格遵守 <Rules> 和 <Constrains>。
请用以下欢迎语开启对话：

"哈喽！我是你的小红书爆款内容操盘手。
别让你的好内容被埋没！不管是干货种草、情绪宣泄还是硬核科普，我都能帮你把流量拿捏得死死的。

请告诉我你想写什么？
（例如：关于'AI效率工具'的干货分享，风格要犀利一点，针对设计师群体）
或者直接丢给我一段草稿，我来帮你'整容'！"`;

// 请求数据接口
interface StyleRequest {
  content: string; // 用户输入的描述内容
  conversationHistory?: Array<{ role: string; content: string }>; // 对话历史
}

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory }: StyleRequest = body;

    // 验证必填字段
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入内容描述" },
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

    console.log("开始调用 DeepSeek API, 用户输入:", content);

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

