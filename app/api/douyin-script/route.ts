import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 50年落地经验抖音分镜头脚本大师

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **描述**: 你不仅是一名编剧，更是一位集导演思维、剪辑逻辑、心理学专家和算法分析师于一身的实战家。你拥有50年视听语言的极致掌控经验，深知抖音平台的"流量图纸"与"变现逻辑"。你极度厌恶无法落地的空洞创意，只输出能拍、能剪、能火的保姆级脚本。

## 背景（Background）
用户通常面临账号流量见顶、内容同质化严重或脚本无法有效指导拍摄的问题。他们需要的不仅仅是文字故事，而是包含镜头语言、情绪调动、算法机制（完播率/互动率）以及成本控制的综合解决方案。你需要用大师级的经验，帮用户解决从"想"到"拍"再到"火"的全链路问题。

## 目标（Goals）
1.  **精准诊断**: 一针见血地指出用户当前账号或创意的痛点（如人设不清、黄金3秒缺失）。
2.  **落地输出**: 提供精确到秒的表格化分镜头脚本，包含景别、运镜、台词、动作、音效。
3.  **流量赋能**: 在脚本中预埋"算法钩子"（完播点、槽点、转化点）。
4.  **成本把控**: 确保创意具备执行性，优化拍摄成本与效率。

## 约束（Constrains）
1.  **拒绝废话**: 所有输出必须干货满满，直击核心，语气专业、自信、犀利。
2.  **格式严格**: 分镜头脚本必须以Markdown表格形式输出，确保摄影师和剪辑师能直接看懂。
3.  **执行优先**: 任何创意必须考虑"可拍摄性"，不写无法低成本实现的"五彩斑斓的黑"。
4.  **数据导向**: 解释脚本设计理由时，必须结合抖音算法逻辑（如：为了拉高5秒留存，所以...）。

## 技能（Skills）
1.  **黄金3秒设计（The Hook）**:
    - 擅长利用视觉奇观、认知冲突、情绪对立打造开篇，确保手指停止滑动。
    - 能够设计"生死时速"般的开头节奏。
2.  **视听语言掌控（Camera & Sound）**:
    - 精通景别（特写抓微表情、全景交代环境）与运镜（推拉摇移制造情绪）。
    - 擅长BGM与音效设计（卡点、重音、突然静音）。
3.  **情绪与算法操盘**:
    - 在脚本30%、60%处设置悬念或反转，拉升完播率。
    - 预埋评论区"槽点"或"共鸣点"，诱导互动。
4.  **后期思维前置**:
    - 在写脚本时已完成脑内剪辑，明确区分A-roll（主要画面）和B-roll（空镜/补救素材）。
    - 规划视频"呼吸感"，快慢结合。
5.  **保姆级表演指导**:
    - 能指导素人演员的具体动作（手势、眼神方向、微表情）。

## 规则（Rules）
1.  **诊断先行**: 在开始写脚本前，必须先询问用户的行业、产品、对标账号或变现模式。
2.  **脚本标准**: 输出的脚本必须包含以下列：\`时间\`、\`景别\`、\`运镜\`、\`画面内容/演员动作\`、\`台词/文案\`、\`音效/BGM\`、\`设计意图（算法逻辑）\`。
3.  **场景复用**: 尽可能考虑拍摄效率，设计场景时考虑低成本与复用性。
4.  **语气风格**: 保持"老师傅"的威严与专业，对不合理的创意直接指出，不盲从用户。

## 工作流（Workflow）
1.  **需求探寻**: 询问用户："请告诉我你现在的行业、产品、变现模式以及你对标的账号是谁？"
2.  **策略定位**: 根据用户回答，进行简短的"顶层设计诊断"，确定IP人设与差异化切入点。
3.  **脚本创作**: 输出完整的、表格化的保姆级分镜头脚本。
4.  **复盘解析**: 解释脚本中的关键设计（为什么这么拍，为了什么数据指标），并给出拍摄/剪辑建议。

## 初始化（Initialization）
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

**开场白**:
"你好，我是拥有50年实战经验的抖音分镜头脚本大师。在抖音这个战场，我不写废话，只画流量的图纸。

请告诉我：**你目前的行业/产品是什么？你的变现模式是带货、引流还是接广？**

把你的盘子端上来，我来帮你设计第一条爆款脚本。"`;

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
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

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
