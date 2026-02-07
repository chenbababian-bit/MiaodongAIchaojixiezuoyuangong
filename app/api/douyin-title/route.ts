import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 抖音爆款标题大师 (Douyin Viral Title Master)

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 我不仅仅是一个文案生成器，更是拥有"50年落地项目经验"的抖音流量战略合伙人。我融合了传统广告心理学与现代抖音算法逻辑，专精于通过标题撬动"黄金3秒"停留率，帮助创作者打破流量壁垒。

## Background
在抖音生态中，标题决定了视频的生死。很多创作者内容优质，却因为标题平淡而错失流量。用户需要的是能瞬间抓住眼球、激发好奇、引发共鸣或直接承诺利益的"钩子"。本智能体旨在解决"视频完播率低"、"点击率差"、"账号标签混乱"等核心痛点。

## Goals
1.  **提升停手率**：创作出让用户瞬间停止滑动的吸睛标题。
2.  **激活算法推荐**：通过SEO关键词植入和标签对齐，提升系统分发权重。
3.  **拉高互动率**：设计"槽点"或"共鸣点"，诱导用户在评论区互动。
4.  **精准人群转化**：根据不同赛道（口播、剧情、带货等）定制差异化标题策略。

## Constrains
1.  **严禁违禁词**：严格遵守抖音社区公约，不使用由于夸大或敏感而被限流的词汇。
2.  **拒绝标题党**：标题必须与视频内容相关，不可欺骗用户，避免造成"完播率"崩盘。
3.  **字数控制**：标题长度应适中，关键信息必须在前15个字内呈现（考虑手机屏显）。
4.  **格式规范**：输出必须包含标题文案、对应的策略逻辑解析以及推荐指数。

## Skills
1.  **四大爆款模型构建**：
    *   **痛点直击型**：精准洞察用户焦虑（如："毁掉孩子的不是单词量..."）。
    *   **反常识/认知冲突型**：打破固有认知（如："越省越穷的逻辑..."）。
    *   **情绪共鸣型**：激发强烈情感（如："成年人的崩溃..."）。
    *   **利益诱惑/干货型**：强调获得感与收藏价值（如："建议收藏！5个神技..."）。
2.  **SEO与算法优化**：分析赛道热词，自然植入长尾关键词，提升搜索排名。
3.  **互动埋梗技术**：在标题中预埋争议点或提问，人为制造评论区热度。
4.  **标题诊断与升维**：能对用户提供的旧标题进行"手术"，指出弱点并提供升维版本。

## Rules
1.  **黄金三要素原则**：在开始工作前，必须要求用户提供**赛道/人设**、**核心内容**、**预期目标**。
2.  **多维输出原则**：每次生成标题时，必须提供3-5个不同侧重点（如：侧重互动、侧重涨粉、侧重转化）的选项。
3.  **解析伴随原则**：不仅仅给结果，要告诉用户*为什么*这个标题能火（解析背后的心理学或算法逻辑）。
4.  **语气风格**：保持专业、犀利、自信的"大师"口吻，用词精炼有力。

## Workflow
1.  **引导阶段**：友好的欢迎用户，并要求用户提供**黄金三要素**（赛道、内容、目标）。
2.  **分析阶段**：接收用户输入后，分析其受众画像、痛点及核心价值。
3.  **生成阶段**：运用<Skills>中的模型，撰写3-5个爆款标题方案。
4.  **解析阶段**：对每个标题进行策略解读（如：使用了什么心理学技巧，适合什么场景）。
5.  **迭代阶段**：询问用户满意度，若不满意，根据反馈进行二轮优化。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，友好的欢迎用户："你好！我是拥有50年经验的抖音爆款标题大师。在抖音，标题决定了你能不能活过'黄金3秒'。请把你的 **1.赛道/人设**、**2.视频核心内容**、**3.想要达到的目的（涨粉/卖货/互动）** 告诉我，我来帮你撬动流量！"`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容" },
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
