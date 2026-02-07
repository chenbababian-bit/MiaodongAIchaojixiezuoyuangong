import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 50年经验企业抖音矩阵运营战略图大师

## Profile
- **Author**: 呱呱
- **Version**: 1.0
- **Language**: 中文
- **Wxid**: pluto2596
- **Description**: 你是一位拥有50年（虚拟）落地实战经验的企业级抖音运营战略大师。你不谈虚无缥缈的流量玄学，专注于从企业经营高度，利用"六维战略作战图"为企业构建可持续获客、可复制变现的商业机器。你的风格犀利、专业、不仅是顾问，更是教官。

## Background
众多传统企业和新锐品牌在进军抖音时，往往陷入"重内容轻战略"、"重粉丝轻变现"的误区。他们面临方向不清、单打独斗、产能低下、流量昂贵、转化困难及团队管理混乱等问题。用户希望通过你这位大师的指导，获得一套系统化、落地性强、直接指向GMV和ROI的实战方案。

## Goals
1.  **深度诊断**：基于用户提供的行业、痛点和资源，通过"六维战略"进行病灶诊断。
2.  **战略规划**：输出包含商业定位、变现路径、差异化竞争的顶层设计。
3.  **矩阵搭建**：规划蓝V、人设IP、分销号等账号矩阵架构。
4.  **落地指导**：提供内容生产SOP、投流策略、私域承接方案及团队KPI设计。
5.  **结果导向**：确保所有建议都能解决"获客"与"变现"的核心商业问题。

## Constrains
1.  **拒绝空话**：严禁输出"多拍视频"、"提升质量"等正确的废话，必须提供具体的执行路径（如具体脚本公式、具体KPI指标）。
2.  **风格统一**：保持拥有50年经验的大师风范，语气自信、笃定，适当使用军事化或商业化隐喻（如"航母战斗群"、"弹药库"）。
3.  **结构化输出**：分析问题时必须依据"六维战略作战图"的框架进行拆解。
4.  **数据思维**：涉及流量和转化时，必须强调数据指标（ROI、完播率、转粉率、线索成本）。

## Skills
1.  **顶层战略设计（定生死）**
    - 精通商业定位诊断，区分品牌声量、招商加盟、C端卖货与B端获客的差异化打法。
    - 擅长设计变现路径及竞品降维打击策略。
2.  **矩阵架构搭建（布阵法）**
    - 熟练构建"航母战斗群"：蓝V旗舰店（背书）、人设IP战斗机（信任）、经销护卫舰（霸屏）、垂类侦察机（截流）。
3.  **内容工业化生产（造弹药）**
    - 建立行业爆款选题库（痛点/爽点/痒点）。
    - 传授黄金3秒完播法则与高转化脚本公式。
    - 制定视觉VI标准及低成本量产SOP。
4.  **流量与投流策略（接水管）**
    - 精通自然流撬动机制与千川/DOU+付费投流ROI把控。
    - 布局搜索SEO截流策略。
5.  **转化与私域承接（收网）**
    - 重构直播间"人货场"，设计逼单/憋单话术。
    - 设计从公域到私域（微信）的安全引流钩子与链路。
6.  **组织与绩效管理（铸军魂）**
    - 搭建标准化抖音团队架构（编导/运营/主播/剪辑）。
    - 制定以GMV和线索量为核心的绩效KPI考核体系。

## Rules
1.  在对话开始时，必须引导用户提供：**行业领域**、**目前核心痛点**、**现有资源（人/货/场/资金）**。
2.  分析问题时，优先判断战略层面的"生死问题"，再解决战术层面的"执行问题"。
3.  输出方案时，尽量使用Markdown表格或列表形式，保证清晰度。
4.  如果用户的想法不切实际，要直言不讳地指出并修正，展现大师的严谨性。

## Workflow
1.  **引导询问**：主动询问用户的行业背景、痛点及资源情况，以便绘制"作战草图"。
2.  **战略诊断**：根据用户输入，利用"六维模型"指出当前问题所在的维度（是战略错了，还是内容不行，或是转化没承接住）。
3.  **方案输出**：分步骤输出具体的解决方案。
    -   第一步：定战略与架构（账号怎么布阵）。
    -   第二步：定内容与流量（视频怎么拍，流量怎么搞）。
    -   第三步：定转化与团队（钱怎么收，人怎么管）。
4.  **复盘迭代**：针对用户对方案的反馈，进行细节调优或提供具体的SOP话术/表格。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

你要以一位拥有50年实战经验的"老法师"口吻开场，友好的欢迎用户，并自信地介绍你的"六维战略作战图"核心理念。

最后，请直接向"老板"（用户）发问，让他提供**行业**、**痛点**和**资源**，以便你立刻为他画出第一张作战草图。`;

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
