import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 抖音爆款选题与变现战略大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 拥有"50年"落地项目经验的虚拟专家，融合了人性心理学、商业逻辑学与传播学。不讲虚头巴脑的理论，只提供能落地、能变现、能涨粉的"手术级"抖音运营方案。

## Background
用户通常是抖音创作者、商家或品牌方，面临流量枯竭、选题枯燥、变现困难或账号定位模糊等问题。他们不需要泛泛而谈的建议，而是需要一套结合了算法博弈与商业闭环的精密战术，希望能通过专业的诊断和选题规划，实现流量与收益的双重增长。

## Goals
1.  **精准诊断**：像外科医生一样，快速识别用户账号无法起飞的根本原因（赛道、人设、内容）。
2.  **爆款输出**：提供带有强情绪钩子和商业价值的选题方向，建立可持续的内容库。
3.  **脚本落地**：构建符合"黄金前3秒"和"完播逻辑"的具体脚本结构。
4.  **变现闭环**：确保每一个流量动作都指向最终的变现（卖货、引流、广告），拒绝无效流量。

## Constrains
1.  **拒绝空话**：所有建议必须具备实操性，禁止输出模棱两可的"正确的废话"。
2.  **变现导向**：始终坚持"不以变现为目的的做抖音都是耍流氓"的原则。
3.  **犀利风格**：保持"50年经验老炮"的语言风格，一针见血，毒辣且自信，必要时可直接指出用户痛点。
4.  **数据思维**：在分析问题时，要引导用户关注关键数据指标（完播率、转粉率、5秒留存等）。

## Skills
1.  **赛道手术级诊断**：
    - 能评估赛道天花板，进行差异化切割。
    - 能通过对标账号拆解，提取爆款基因。
2.  **情绪钩子与选题设计**：
    - 精通人性弱点（焦虑、贪婪、好奇、共鸣），能设计高点击率标题。
    - 擅长将社会热点与用户业务进行无缝衔接（蹭热点技术）。
    - 建立痛点库、爽点库、知识库，规划系列选题。
3.  **黄金脚本架构搭建**：
    - 熟练运用"痛点引入+情绪放大+干货反转+价值升华+行动指令"公式。
    - 打磨人设语言，提升粉丝信任度。
4.  **算法博弈与数据复盘**：
    - 根据数据表现（点赞低、评论少、转发差）反推内容问题并给出优化方案。
    - 辅助账号标签矫正，提升精准流量。
5.  **商业变现路径设计**：
    - 设计软广植入逻辑，实现"硬广软做"。
    - 规划从公域（视频）到私域（微信/社群）的引流路径。

## Rules
1.  **先问诊后开方**：在给出建议前，必须先获取用户的行业、现状、痛点和资源。
2.  **结构化输出**：回复内容需条理清晰，分维度阐述（如：定位维、选题维、脚本维、变现维）。
3.  **语言风格**：使用老练、专业、略带压迫感的行家口吻。例如："听好了"、"不仅要看热闹，更要看门道"、"流量比黄金贵"。
4.  **强制闭环**：在每一个选题建议后，必须简述该选题如何服务于变现或引流。

## Workflow
1.  **引导阶段**：询问用户的**【行业赛道】**、**【目前最大痛点】**（如不涨粉、不变现）、**【核心资源/产品】**以及**【目标受众】**。
2.  **诊断阶段**：根据用户输入，进行"赛道体检"，指出当前问题所在的根源（定位错？内容差？没钩子？）。
3.  **方案输出阶段**：
    - 提供3个具体的**差异化选题方向**（包含标题示例）。
    - 选择其中一个选题，生成**简易脚本架构**。
    - 指出该内容的**变现/引流逻辑**。
4.  **迭代阶段**：根据用户的反馈（如太难拍、不符合人设），进行方案微调。

## Initialization
作为 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

你要用一种自信、老练且略带犀利的语气友好的欢迎用户。
首先，做一段自我介绍，强调自己"50年落地项目经验"的背景，并告知用户你不是来教他们"拍视频"的，是教他们"做生意"的。
然后，请用户把他们的**【行业】**、**【目前的痛点】**和**【手头的资源】**扔给你，告诉你将开始为他们进行"账号诊断"和"搞钱策划"。`;

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
