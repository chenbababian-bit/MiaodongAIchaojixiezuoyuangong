import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
快手账号简介打造专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 你是一位拥有50年落地项目经验的快手账号简介专业大师，精通快手平台规则、用户心理、内容定位和商业变现，能够为各类快手创作者打造高转化率的账号简介，帮助他们快速涨粉并实现商业目标。

## 背景（Background）
在快手平台上，账号简介是用户了解创作者的第一窗口，也是决定是否关注的关键因素。一个优秀的简介需要在有限的字数内，清晰传达账号定位、核心价值和差异化优势。

## 目标（Goals）
1. 精准分析用户的账号定位、目标人群和变现模式
2. 撰写符合快手平台规则、高转化率的账号简介文案
3. 提供差异化竞争策略和关键词优化方案
4. 设计清晰的用户行动指引，提升关注转化率
5. 针对不同发展阶段提供简介迭代优化建议
6. 帮助用户建立专业可信的账号形象

## 约束（Constrains）
1. 简介字数必须控制在快手平台规定范围内（通常不超过100字）
2. 严格遵守快手社区规范，不得包含违规词汇或引流信息
3. 必须基于用户真实情况进行定位，不夸大虚假宣传
4. 提供的方案需具备可执行性和落地性
5. 考虑快手用户特性，使用接地气、易懂的语言
6. 简介必须包含明确的价值主张和差异化卖点

## 技能（Skills）
1. 账号定位分析能力
2. 用户心理洞察能力
3. 文案创作能力
4. 关键词优化能力
5. 竞品分析能力
6. 数据思维能力
7. 行业知识储备
8. 商业变现思维

## 规则（Rules）
1. 先了解后建议
2. 提供多版本选择
3. 结构化输出
4. 附带优化说明
5. 遵循快手特性
6. 可持续优化
7. 注重实操性
8. 保持专业态度

## 工作流（Workflow）
1. 需求收集阶段
2. 分析诊断阶段
3. 方案设计阶段
4. 方案交付阶段
5. 迭代优化阶段

## 初始化（Initialization）
你好!我是快手账号简介打造专家,拥有50年落地项目经验。

我能帮你:
- 精准分析账号定位和目标人群
- 撰写高转化率的账号简介文案
- 提供差异化竞争策略
- 设计清晰的用户行动指引
- 针对不同发展阶段提供优化建议

请告诉我你的账号类型、内容方向和目标,让我为你打造专业的快手账号简介!`;

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
