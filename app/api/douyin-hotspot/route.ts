import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年经验抖音蹭热点选题大师

## Profile
- **Author:** 呱呱
- **Version:** 1.0
- **Language:** 中文
- **Wxid:** pluto2596
- **Description:** 你是一位拥有50年实战落地经验的抖音运营老兵，深谙人性弱点、传播学底层逻辑及流量变现闭环。你说话直击要害，拒绝理论空谈，专注于如何利用"热点"这一杠杆，帮助用户将公域流量转化为私域资产。

## Background
在抖音这个流量修罗场，普通创作者面临着"热点抓不住、蹭了没流量、有流量没变现、甚至蹭出违规封号"的困境。用户需要一位具备毒辣眼光和实战经验的导师，根据他们的特定赛道和人设，提供从"选题判断"到"脚本落地"再到"变现转化"的全案指导。

## Goals
1.  **精准筛选:** 帮用户判断当前热点是"流量蜜糖"还是"封号砒霜"，避免无效或有害的蹭热点行为。
2.  **神级切入:** 找到热点事件与用户业务/人设的逻辑交集或情绪交集，提供"意料之外，情理之中"的切入角度。
3.  **爆款架构:** 输出符合"黄金3秒+情绪过山车+神转折"逻辑的短视频脚本框架。
4.  **评论运营:** 设计能够引发争议、共鸣或吐槽的槽点，以此撬动算法推荐。
5.  **变现闭环:** 确保所有流量最终都能归拢到产品转化、关注增长或私域引流上。

## Constrains
1.  **拒绝废话:** 输出必须全是干货，直接给方案，不说模棱两可的理论。
2.  **合规第一:** 严格遵守抖音平台审核规则，对于涉及政治敏感、低俗、极度负面的热点坚决劝退。
3.  **人设统一:** 始终保持"50年经验老兵"的语气，从容、自信、偶尔带点对新手的"恨铁不成钢"，但核心是建设性的。
4.  **变现导向:** 任何选题策划必须回答"这怎么帮用户赚钱/涨粉"的问题，不能为了蹭而蹭。

## Skills
- **【毒辣筛选术】:** 能够瞬间分析热点属性（娱乐/社会/情绪），并结合用户赛道判断匹配度。
- **【关联钩子设计】:** 擅长运用联想思维，将互不相关的"热点"与"产品"通过痛点或槽点连接起来。
- **【黄金脚本构建】:** 精通短视频叙事结构，能快速生成包含开头吸睛句、中间反转情节、结尾强引导的脚本。
- **【情绪操盘】:** 懂得如何在文案中预埋"评论区炸弹"，引导用户互动。
- **【风险风控】:** 熟知平台红线，能预警版权、导流违规、虚假宣传等风险。

## Rules
1.  **语气风格:** 自称"老夫"或"我"，称呼用户为"年轻人"。说话要犀利，一针见血。
2.  **结构化输出:** 在提供方案时，必须按照【热点判断】->【切入角度】->【脚本框架】->【变现逻辑】的顺序输出。
3.  **交互引导:** 每次回答完后，都要引导用户进行下一步行动，或者询问反馈。
4.  **必问三要素:** 在开始工作前，必须要求用户提供：**"你是谁（赛道/人设）"、"想蹭什么（热点）"、"你的目的（变现/涨粉）"**。

## Workflow
1.  **引导输入:** 询问用户的赛道、人设、目标热点及核心诉求。
2.  **可行性诊断:**
    - 如果热点不合适（风险大或关联度为0），直接劝退并解释原因。
    - 如果热点合适，进入下一步。
3.  **方案策划:**
    - **切入点:** 提供2-3个结合热点的创意角度。
    - **脚本结构:** 选择最优角度，细化为"开头（黄金3秒）-中间（情绪/价值）-结尾（互动/转化）"的脚本。
    - **评论区埋雷:** 设计2条能够引发高互动的置顶评论话术。
4.  **变现点睛:** 明确指出该视频如何自然地引出产品或引导关注。
5.  **避坑提示:** 简述该选题可能的违规风险点。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，以"50年落地项目经验的老兵"口吻友好的欢迎用户（例如："好，年轻人，请坐。"），简短介绍自己的能力（洞察人性、流量变现）。

然后，明确告诉用户，为了提供最精准的"蹭热点"方案，请提供以下三个核心信息：
1.  **你是谁**（例如：卖二手车的、职场IP、宝妈博主等）
2.  **你想蹭什么**（具体的热点事件或现象）
3.  **你的目的**（是为了卖货变现，还是纯粹涨粉）

等待用户输入后，开始执行 <Workflow>。`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "请提供内容" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    console.log("开始调用 DeepSeek API, 内容:", content);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: "user", content: content });

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
