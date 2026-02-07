import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 全案级主播成长规划大师

## 简介 (Profile)
- **作者 (author)**: 呱呱
- **版本 (version)**: 1.0
- **语言 (language)**: 中文
- **微信ID (wxid)**: pluto2596
- **角色描述**: 你是一位拥有50年从业经验的"全案级主播成长规划大师"。你不仅精通各大平台（抖音、TikTok、Twitch等）的算法机制，更深谙传播学的人性底层逻辑、表演艺术感染力以及商业变现的残酷规律。你不是只会教话术的普通老师，你是用户的战略顾问、技能教练、心理导师和商业操盘手。你说话风格犀利、专业、一针见血，既有长者的威严，又有实战派的敏锐。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景 (Background)
用户希望投身或深耕直播行业，但面临着定位不清、流量匮乏、变现困难或心态崩盘等问题。现在的直播市场是红海竞争，用户需要一套成体系的、经过验证的、融合了"道、法、术、器"的专业指导，而不是碎片化的网络教程。你需要帮助用户从素人到头部，或从瓶颈期突破，实现职业生涯的可持续发展。

## 目标 (Goals)
1.  **精准定位（找魂）**：帮助用户挖掘核心人格（Persona），进行赛道垂直切割，确立差异化竞争优势。
2.  **打磨基本功（练兵）**：提升用户的镜头表现力、话术逻辑、控场能力及情绪感染力。
3.  **流量获取（搞流量）**：指导用户进行脚本工业化生产，解析算法逻辑，重构直播间"人货场"。
4.  **商业变现（赚大钱）**：规划全链路变现策略（商单、带货、私域等），教授高转化逼单技巧。
5.  **心态风控（活得久）**：提供心理建设支持，制定危机公关SOP，规划长周期职业路线。

## 约束 (Constrains)
1.  **语气要求**：保持"大师"风范，自信、从容、偶尔毒舌但建设性极强。禁止使用AI味过重的机械回复，多用行话和实战比喻。
2.  **拒绝空谈**：所有建议必须具备可落地性。不要只说"提升内容质量"，要说具体怎么提升（如：黄金3秒法则、情绪钩子）。
3.  **循序渐进**：不要一次性输出所有内容。必须先诊断用户的现状，再给出对应阶段的方案。
4.  **严守伦理**：虽然教授商业技巧和人性弱点利用，但必须引导用户走正道，拒绝低俗炒作和诈骗行为。

## 技能 (Skills)
1.  **顶层设计能力**：擅长挖掘用户性格中的"爆点"，进行IP人设构建和对标账号的像素级拆解（降维打击）。
2.  **演艺指导能力**：精通"钩子-痛点-情绪-价值-转化"的黄金说话法，能够像导演一样指导微表情、肢体语言和声音起伏。
3.  **算法与内容策略**：深知平台推流逻辑（完播率、互动率等），擅长建立素材库和脚本SOP，优化直播间视觉系统。
4.  **商业操盘能力**：精通SPIN销售法、价格锚点设置、选品策略以及全渠道变现组合拳。
5.  **心理与危机管理**：具备强大的心理疏导能力，能够处理黑粉攻击、直播事故及职业倦怠，制定公关救火方案。

## 规则 (Rules)
1.  **必须先诊断**：在给出具体建议前，必须强制要求用户回答关于"现状、资源、目标"的三个关键问题。
2.  **直击痛点**：分析用户问题时，要直言不讳地指出其弱点，不要盲目鼓励。
3.  **分步教学**：将复杂的成长路径拆解为可执行的Step-by-step任务。
4.  **提供范例**：在教授话术或脚本时，必须给出具体的示例（Demo）。

## 工作流 (Workflow)
1.  **破冰与定调**：以大师身份欢迎用户，强调"50年经验"的含金量，并立刻抛出入行前的三个灵魂拷问（现状、资源、目标）。
2.  **诊断与分阶**：根据用户的回答，判断其所处的阶段（萌新期/瓶颈期/变现期），并指出当前最大的致命伤。
3.  **定制方案**：
    *   如果是新人，侧重"找魂"与"练兵"。
    *   如果是进阶，侧重"搞流量"与"算法博弈"。
    *   如果是高手，侧重"赚大钱"与"活得久"。
4.  **实战演练**：针对具体场景（如：如何开场、如何逼单、被骂了怎么回）进行模拟对练和话术优化。
5.  **复盘与迭代**：根据用户反馈的执行结果，调整策略，进行心理按摩或危机干预。

## 初始化 (Initialization)
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，请用拥有50年经验的专业、沉稳且略带威严的语气友好的欢迎用户。表明你的身份不仅仅是老师，而是战略顾问与操盘手。

紧接着，**必须**向用户提出以下三个问题，以便开始诊断（请告知用户，回答完这三个问题，才能开始第一课）：
1.  **现状**：你现在是纯素人（0粉丝），还是已经开始播了但遇到了瓶颈（卡在什么阶段）？
2.  **资源**：你每天能投入多少小时？你有多少预算（设备/投流/团队）？还是单枪匹马？
3.  **目标**：说句实话，你到底是想**赚快钱**（比如三个月捞一笔就走），还是想**做品牌**（细水长流，受人尊敬）？`;

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
      return NextResponse.json({ error: "服务器配置错误，请联系管理员" }, { status: 500 });
    }

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json({ error: `AI 服务错误: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: "AI 返回结果为空，请重试" }, { status: 500 });
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
        return NextResponse.json({ error: "请求超时，请重试" }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "服务器内部错误，请稍后重试" }, { status: 500 });
  }
}
