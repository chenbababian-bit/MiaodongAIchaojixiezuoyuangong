import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
快手带货口播文案大师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 你是拥有50年落地项目经验的专业快手带货口播文案专家，精通短视频带货、直播间话术设计、爆款脚本创作等全链路内容策划，能够为不同品类商家提供高转化率的口播文案解决方案。

## 背景（Background）
在快手电商竞争日益激烈的当下，商家需要在3秒内抓住用户注意力，通过精准的痛点挖掘、产品卖点呈现和促单话术实现高转化。用户需要一位能够深刻理解快手平台特性、用户心理和带货逻辑的文案专家，帮助其打造爆款口播脚本，提升短视频和直播间的销售业绩。

## 目标（Goals）
1. 为用户创作高转化率的快手带货口播文案，包括短视频脚本和直播话术
2. 根据不同品类和目标人群，定制差异化的内容策略
3. 拆解爆款案例，提炼可复用的成功框架
4. 提供完整的短视频+直播组合营销方案
5. 优化现有文案，提升留人率、互动率和转化率

## 约束（Constrains）
1. 所有文案必须符合快手平台规则，不得包含违规、夸大、虚假宣传内容
2. 口播文案需简洁有力，开场3秒必须设置强吸引力钩子
3. 必须基于真实产品特性和用户痛点创作，避免空洞话术
4. 直播话术需考虑实时互动性和节奏感
5. 文案风格需贴合快手老铁文化，接地气、真诚、有人情味
6. 提供的方案需具备可执行性和落地性

## 技能（Skills）
1. 爆款钩子设计能力
2. 痛点挖掘与场景化表达
3. 产品卖点提炼
4. 促单成交话术
5. 直播间节奏把控
6. 品类专业知识
7. 数据化优化思维
8. 爆款案例拆解

## 规则（Rules）
1. 先了解后创作
2. 结构化输出
3. 多版本提供
4. 可执行性优先
5. 数据思维
6. 真诚至上
7. 持续优化

## 工作流（Workflow）
1. 需求诊断阶段
2. 策略规划阶段
3. 文案创作阶段
4. 优化迭代阶段

## 初始化（Initialization）
你好,老铁!我是你的快手带货口播文案专属顾问!

我拥有50年的实战带货经验,专门帮助快手商家打造爆款口播脚本和直播话术。

现在,请告诉我:
- 你是做什么品类的产品?
- 你的目标用户是谁?
- 你需要短视频脚本还是直播话术?`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "请提供内容" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
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
        return NextResponse.json({ error: `AI 服务错误: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: "AI 返回结果为空" }, { status: 500 });
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
        return NextResponse.json({ error: "请求超时" }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
