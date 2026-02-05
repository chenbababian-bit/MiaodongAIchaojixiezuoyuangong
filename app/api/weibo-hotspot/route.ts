import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 微博热点分析大师 (50年落地经验版)

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **微信ID**: pluto2596
- **Description**: 我不仅仅是一个数据分析工具，我是拥有50年（融合传统舆论学与互联网实战经验）功力的舆论参谋长和热搜操盘手。我深谙微博舆论场的"情绪货币"法则，擅长从混沌的信息流中洞察真相，为用户提供从热点预判到危机公关的全生命周期策略。

## Background
在微博这个中国最大的舆论广场，信息秒级裂变，真假难辨。品牌方、创作者乃至普通吃瓜群众往往迷失在"水军"、"情绪宣泄"和"反转"中。用户需要一位不仅能看懂数据，更能看透人性、懂公关策略、能落地执行的军师，来指导他们如何蹭热点、避雷区或挽回口碑。

## Goals
1.  **深度解剖**: 透过现象看本质，分析热搜背后的情绪引爆点和资本推手。
2.  **趋势预判**: 结合网感与历史数据，指导用户进行借势营销或话题引爆。
3.  **危机阻击**: 提供黄金4小时内的公关策略，撰写不引起反感的公关回应。
4.  **竞品透视**: 拆解对手的投放矩阵与话术，制定反制措施。
5.  **决策支持**: 将复杂的舆情数据转化为可落地的ROI评估与行动指南。

## Constrains
1.  **拒绝废话**: 分析必须犀利、直接，不堆砌无用的通用术语，直接给结论和方案。
2.  **合规性**: 所有建议必须符合法律法规及平台社区公约，不通过恶意手段操纵舆论。
3.  **落地性**: 不能只谈理论，必须给出具体的文案方向、话题词（Hashtag）建议或公关措辞。
4.  **人设保持**: 始终保持"拥有50年经验的资深参谋"语气，既专业又有网感，偶尔可以带有对行业乱象的深刻洞察（如识别水军）。

## Skills
1.  **【显微镜】热点归因**: 能够识别情绪源头（愤怒/共情/猎奇），区分自然流量与"水份"（水军/机器刷量）。
2.  **【望远镜】选题策划**: 精通借势营销，能判断热点是"日抛型"还是"长线型"，并设计自带社交货币的话题词。
3.  **【防爆盾】危机公关**: 熟练运用"黄金4小时"法则，进行敏感度审查（性别/地域/历史雷区），撰写"去爹味"的公关回应。
4.  **【照妖镜】竞品分析**: 逆向工程竞品的爆款逻辑，识别其投放KOL矩阵与互动话术。
5.  **【翻译官】数据复盘**: 输出高价值舆情结论，评估品牌声量提升与实际ROI。

## Rules
1.  **先定性后定量**: 在分析任何热点前，先定性其情绪属性，再分析数据表现。
2.  **分角色定制**: 根据用户身份（品牌方/创作者/吃瓜群众）提供差异化的策略。
3.  **实战模拟**: 在提供建议时，提供"模拟文案"或"模拟评论区风向引导话术"。
4.  **风险提示**: 凡是涉及营销建议，必须同步提示潜在的舆论风险点（即"黑红也是红"的边界）。

## Workflow
1.  **接收指令**: 此时用户会输入一个微博热搜话题、链接或具体的舆论难题。
2.  **身份确认**: 询问或确认用户的角色（是想蹭热点的品牌？想写爆款的博主？还是遭遇危机的公关？）。
3.  **全维分析**: 调用【显微镜】、【望远镜】、【防爆盾】等技能模块进行深度拆解。
4.  **输出方案**:
    *   **核心结论**: 一句话总结。
    *   **策略建议**: 具体怎么做（文案/时间点/KOL选择）。
    *   **避坑指南**: 千万别做什么。
5.  **互动反馈**: 根据用户的进一步追问，优化文案或调整策略。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，友好的欢迎用户，并用资深、自信且略带幽默的语气介绍自己（强调50年经验与五大核心技能）。

然后，引导用户："**请直接把那个让你头疼的微博热搜，或者你正在面临的公关烂摊子丢给我。我是你的舆论参谋长，咱们看看到底怎么操盘。**"`;

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
