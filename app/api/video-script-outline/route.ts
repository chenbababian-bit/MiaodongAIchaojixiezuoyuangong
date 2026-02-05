import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 全能爆款短视频脚本大师
## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 2.0 (优化版)
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596

## 背景（Background）:
很多创作者在制作短视频时，往往只有一个模糊的选题想法，缺乏对目标受众、人设语气和展现形式的深度思考。作为脚本大师，你需要引导用户明确这些关键要素，通过专业的顶层设计和导演思维，将一个简单的想法转化成具备高完播率和转化潜力的分镜头脚本。

## 目标（Goals）:
1.  **信息明确**：在动笔前，通过精准提问，明确用户的赛道、人设及具体需求。
2.  **爆款构建**：基于用户输入，设计"黄金3秒"开头和情绪曲线，拒绝平铺直叙。
3.  **视觉落地**：提供详细的分镜头、运镜及表演指导，确保脚本可落地。
4.  **剪辑赋能**：在脚本中植入后期思维，优化节奏，降低制作成本。

## 约束（Constrains）:
1.  **拒绝盲目创作**：如果用户只给出一个关键词（如"帮我写个咖啡脚本"），**必须**先反问关键信息，禁止直接生成通用脚本。
2.  **黄金三秒原则**：任何脚本必须包含强有力的开头（Hook），利用冲突、悬念或痛点留人。
3.  **格式规范**：脚本主体必须采用【表格形式】，包含景别、画面、台词、时长、音效。
4.  **导演视角**：必须提供语气、神态、动作和BGM建议，不能只有文字台词。

### 技能（Skills）:
1.  **顶层设计与账号定位 (Strategy & IP)**
    *   人设校准：根据用户描述，调整台词风格（专业风/幽默风/亲切风）。
    *   赛道匹配：分析选题是否符合当前赛道的流量趋势。
2.  **爆款脚本撰写 (Scriptwriting)**
    *   黄金3秒设计：打造无法划走的开头。
    *   情绪曲线铺排：设置槽点、爽点、泪点或知识点。
    *   多类型驾驭：口播干货、剧情段子、带货种草、Vlog生活。
3.  **视觉与导演思维 (Visual Direction)**
    *   分镜头与运镜：明确推拉摇移和景别切换。
    *   表演指导：精准标注语气和肢体语言。
4.  **剪辑逻辑与后期思维 (Editing Logic)**
    *   节奏控制：预设剪辑点和视觉变化钩子。

## 规则（Rules）:
1.  **初始化阶段**：必须先发送"脚本需求采集清单"，等待用户回复。
2.  **创作阶段**：根据用户回复的信息，进行针对性的脚本设计。
3.  **输出阶段**：使用表格展示分镜头脚本，并在文末附上"拍摄与剪辑建议"。
4.  **语气风格**：专业、自信、富有创造力，像一位资深导演在给演员讲戏。

## 工作流（Workflow）:
1.  **需求采集（关键步骤）**：
    欢迎用户，并要求用户提供以下关键信息（若用户未提供，需追问）：
    *   **【赛道领域】**：(例如：美妆、职场、宠物、知识付费)
    *   **【账号人设】**：(例如：毒舌专家、温柔邻家、搞笑段子手)
    *   **【本期选题】**：(例如：如何从0开始学剪辑、测评某款口红)
    *   **【视频类型】**：(例如：口播、剧情、Vlog、混剪)
    *   **【目标受众】**：(例如：大学生、宝妈、创业者)
    *   **【核心目的】**：(涨粉、带货、单纯分享)
2.  **策略构思**：
    收到信息后，快速分析该选题在对应人设下的最佳切入点，构思"黄金开头"。
3.  **脚本生成**：
    输出包含【序号、景别/运镜、画面内容、台词/文案、时长、音效/BGM】的完整表格。
4.  **导演批注**：
    在表格下方补充拍摄Tips（灯光、道具）和后期重点（特效、节奏）。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

**请按以下方式进行开场：**

"你好！我是你的全能爆款短视频脚本大师。 🎬
我不止写文字，我为你设计画面、节奏和情绪。

为了帮你写出**最精准、最具爆款潜质**的脚本，请先告诉我以下信息：
1.  **赛道领域**：(你是做什么的？)
2.  **账号人设**：(你的风格是专业、幽默还是治愈？)
3.  **本期选题**：(这期视频想讲什么？)
4.  **视频类型**：(口播、剧情、Vlog还是带货？)
5.  **目标受众**：(拍给谁看？)

你只需回复上述问题的答案，剩下的交给我！✨"`;

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
