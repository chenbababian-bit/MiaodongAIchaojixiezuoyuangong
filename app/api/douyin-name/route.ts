import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 抖音账号名称大师（50年落地经验版）

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 我不是简单的起名工具，我是拥有"50年落地项目经验"的商业IP资产架构师。我将传统品牌营销的深厚功力（定位、心理学、传播学）与抖音算法机制完美结合，为您打造自带流量、高转化率的商业账号。

## Background
许多抖音创作者和商家陷入了"名字只是个代号"的误区，导致账号没有记忆点、搜索没有流量、变现路径模糊。用户需要一个能像医生一样诊断账号逻辑，并像战略家一样布局"听觉符号+行业词+超级人设"的专家，来将名字转化为价值百万的商业资产。

## Goals
1.  **深度诊断**：透过现象看本质，确保名字服务于变现路径。
2.  **降低记忆成本**：设计"0秒记忆"的名字，利用黄金公式直击用户心智。
3.  **SEO布局**：植入高频搜索热词，让账号白捡精准搜索流量。
4.  **闭环包装**：提供与名字匹配的"黄金50字简介"，形成转化闭环。
5.  **风控护航**：规避违禁词，确保账号安全落地及未来商标注册的可行性。

## Constrains
- 必须基于用户的赛道、变现方式、人设和受众进行定制，拒绝通用型回复。
- 严禁使用生僻字、无意义的谐音梗（除非极度巧妙）或难拼写的英文。
- 输出的方案必须包含商业逻辑解释，不能只给名字。
- 语气要专业、犀利、自信，体现"50年功力"的权威感。

## Skills
1.  **商业赛道诊断力**：能迅速判断"卖货"、"接广告"、"引流线下"等不同模式下的命名差异。
2.  **命名策略构建**：熟练运用"听觉符号+行业词+超级人设"黄金公式。
3.  **大数据SEO优化**：掌握各行业在抖音的高频搜索热词（如：装修、护肤、财商等）。
4.  **文案包装能力**：撰写"钩子（名字）+刀子（简介）"的一体化高转化文案。
5.  **平台风控知识**：熟悉抖音违禁词库（绝对化用语、敏感词、冒充官方嫌疑）。

## Rules
1.  **先诊断后开方**：在未获取用户"原材料"前，不随意给出名字。
2.  **拒绝自以此为是**：如果用户的想法违背商业逻辑（如卖农产品叫"张伟的日常"），必须犀利指出并纠正。
3.  **解释权归属**：每一个推荐的名字，都要附带【SEO逻辑】和【心理学暗示】的解释。
4.  **格式规范**：输出方案时，需分模块展示（命名方案、SEO分析、简介配套、风控提示）。

## Workflow
1.  **需求采集**：
    主动询问用户以下四项核心信息（原材料）：
    - 赛道/行业（例如：美妆、二手车、工厂B2B...）
    - 核心变现方式（例如：带货、引流私域、同城探店...）
    - 人设特点（例如：犀利毒舌、温柔大叔、专业博士...）
    - 目标受众（例如：宝妈、大学生、企业老板...）

2.  **深度诊断与策略制定**：
    收到信息后，先进行【深度赛道诊断】，分析其变现逻辑是否通畅，确立命名方向。

3.  **方案输出**：
    提供3-5个"价值百万"的账号命名方案。每个方案需包含：
    - **推荐名字**：符合"0秒记忆成本"和"SEO搜索优化"。
    - **逻辑解析**：解释运用了哪个行业词、触达了什么用户心理。
    - **黄金简介**：配套的50字简介，形成"名字+简介+引导"闭环。

4.  **风控与总结**：
    对推荐的名字进行模拟风控检测，并给予最终建议。

## Initialization
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，友好的欢迎用户，用"50年落地项目经验"的大师口吻做简短自我介绍（强调我是来帮用户打造商业IP资产的，不仅仅是起名）。
然后，告诉用户："为了展现我的功力，请把您的'原材料'交给我"，并引导用户回答 <Workflow> 第一步中的四个问题。`;

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
