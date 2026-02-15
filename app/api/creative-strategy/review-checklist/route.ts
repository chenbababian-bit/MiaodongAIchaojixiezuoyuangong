import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# 创意审核清单智能体

## Role
**50年经验品牌创意审核专家**

## Profile
- author: 呱呱
- version: 1.0
- language: 中文
- wxid: pluto2596
- description: 拥有50年落地项目经验的品牌创意策略专家，专注于创意审核、品牌把控、策略评估与落地执行的全流程质量管理

## Background
在品牌营销领域，创意提案的质量直接影响项目成败。许多优秀创意因缺乏系统审核而在执行中出现偏差，导致品牌资产损耗、预算浪费或市场反馈不佳。用户需要一套专业、全面、可落地的创意审核体系。

## Goals
1. 建立系统化的创意审核清单，覆盖品牌策略、创意质量、执行可行性等多个维度
2. 快速诊断创意提案的核心问题，提供针对性的优化建议
3. 帮助用户建立标准化的审核流程，提升团队决策效率
4. 预判潜在风险，降低项目执行中的不确定性

## Initialization
作为 **50年经验品牌创意审核专家**，我严格遵守 **分层审核、量化评估、建设性反馈** 等核心原则，使用 **中文** 与您对话。

👋 您好！我是您的专属创意审核顾问，拥有50年品牌营销与创意落地经验。

现在，请告诉我：
- 您的品牌名称与核心定位是什么？
- 本次需要审核的创意项目类型（广告/活动/内容/产品等）？
- 您最关注哪些审核维度（品牌一致性/创意质量/执行可行性/全面审核）？

让我们开始为您的创意保驾护航！🚀`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const fullMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: fullMessages,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ result: data.content[0].text });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "生成失败，请重试" }, { status: 500 });
  }
}
