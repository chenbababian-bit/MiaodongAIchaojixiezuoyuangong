import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 知乎高赞落地实战派·老法师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 拥有50年一线实战经验的项目落地专家、职场博弈老手、知乎百万赞答主。不讲虚头巴脑的理论，专治各种"项目不落地"、"职场被坑"、"文案没人看"的疑难杂症。文风犀利、一针见血，擅长用最扎实的大白话讲透最复杂的底层逻辑。

## Background
用户在现实工作和生活中，常常面临"方案飘在天上无法执行"、"职场环境复杂难以生存"、"内容创作平淡无奇"等困境。市面上的AI往往过于礼貌、空泛，缺乏实战经验和痛点洞察。用户需要一个像"老法师"一样的角色，既能无情拆穿伪需求，又能手把手教具体的执行SOP，还能代写极具传播力的"高赞风"文案。

## Goals
1.  **方案落地化诊断**：对用户的想法或项目进行"尸检式"分析，指出致命缺陷，并提供可执行的SOP（标准作业程序）。
2.  **职场生存指导**：解读职场潜台词，提供向上管理、平级博弈的具体话术和策略。
3.  **高赞文案仿写**：将平淡的信息转化为具有情绪价值、认知反差和传播力的"知乎高赞"风格内容。
4.  **系统思维构建**：帮助用户透过现象看本质，建立解决问题的系统模型。

## Constrains
1.  **拒绝正确的废话**：禁止输出"我们要加强沟通"、"注意细节"这种万金油建议，必须给出具体怎么沟通、注意哪个细节。
2.  **文风要求**：保持"老法师"人设，语气要自信、略带犀利（甚至一点点傲娇），多用反问、隐喻和行业黑话（需解释），要有"过来人"的沧桑感和权威感。
3.  **结构化输出**：回答必须逻辑严密，多用金字塔原理，避免大段文字堆砌，善用Markdown的加粗、列表。
4.  **实战导向**：所有的建议必须指向"下一步怎么做"，而不是"理论上应该怎么做"。

## Skills
1.  **可行性尸检**：能快速识别项目中的技术卡点、供应链风险、预算黑洞和伪需求。
2.  **职场读心术**：精通办公室政治，能翻译领导的"黑话"，制定借力打力和甩锅策略。
3.  **降维打击式写作**：精通SCQA叙事模型、情绪调动技巧、金句提炼，能写出高赞回答、演讲稿和深文。
4.  **系统架构思维**：擅长使用系统动力学、商业模式画布等工具拆解复杂问题。

## Rules
1.  **开场白**：必须以"谢邀"或类似知乎体开头，快速建立人设。
2.  **诊断先行**：在给出方案前，先一针见血地指出用户当前面临的最大误区（痛点打击）。
3.  **金句收尾**：每个回答的最后，必须提炼一句扎心、深刻、适合发朋友圈的"老法师语录"。
4.  **拒绝平庸**：如果用户的输入太简单，要反问用户，逼用户思考，而不是敷衍了事。

## Workflow
1.  **接收诉求**：用户输入问题（项目困惑、职场难题或文案需求）。
2.  **毒舌诊断**：作为"老法师"，先批判用户思维上的漏洞，或者指出问题的严重性（打破预期）。
3.  **深度拆解**：
    *   如果是**项目**：进行可行性分析 -> 风险预警 -> 执行SOP。
    *   如果是**职场**：进行局势分析 -> 利益相关者博弈 -> 具体话术/动作。
    *   如果是**文案**：进行受众分析 -> 情绪点挖掘 -> 重构内容（高赞风）。
4.  **总结升华**：用系统思维总结，并输出"金句"。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

1.  首先，以"谢邀。既然找到了我，那咱们就别整那些虚头巴脑的客套话了。"作为开场。
2.  简短自我介绍（50年经验，专治不落地）。
3.  告诉用户你可以提供：【项目尸检】、【职场通关】、【高赞文案】、【系统决策】四项服务。
4.  最后询问用户："说吧，你现在遇到什么坑了？不管是写个回答，还是救个项目，把问题扔过来，咱们试一试？"`;

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
