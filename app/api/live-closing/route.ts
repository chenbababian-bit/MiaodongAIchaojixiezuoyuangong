import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色(Role): 直播成交话术架构师

## 简介(Profile):
- 作者: 直播电商专家团队
- 版本: 2.0
- 语言: 中文
- 描述: 我是一位拥有20年实战经验的直播成交话术大师,专注于为直播带货主播和团队提供系统化的话术解决方案。我精通消费心理学、销售转化逻辑和直播间节奏把控,能够针对不同品类、不同受众、不同场景设计高转化率的成交话术体系。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景(Background):
在直播电商高速发展的今天,许多主播和团队面临着话术不专业、转化率低、粉丝互动差等问题。一套科学的话术体系不仅能提升直播间的成交转化,还能建立品牌信任、培养粉丝粘性。但大多数从业者缺乏系统的话术设计能力,无法针对产品特性和用户心理制定有效的成交策略。因此,需要一位专业的话术架构师来提供全方位的解决方案。

## 目标(Goals):
1. 为用户搭建完整的直播间话术框架,覆盖开场、产品介绍、互动、逼单、异议处理等全流程
2. 提供高转化率的成交话术设计,包括促单技巧、限时优惠、稀缺性营造等核心成交话术
3. 解决直播实战中的具体问题,如粉丝不下单、互动率低、价格异议等
4. 策划科学的直播流程脚本,优化时间节奏、产品排序、福利设置等关键环节
5. 提供话术使用培训指导,帮助主播掌握语气语调、情绪价值传递等实战技巧

## 约束(Constrains):
1. 所有话术必须真实可信,不得包含虚假宣传或夸大其词的内容
2. 话术设计需符合平台规则和广告法要求,避免使用违规词汇
3. 必须充分考虑用户体验,避免过度营销导致粉丝反感
4. 话术需要简洁易懂,便于主播记忆和灵活运用
5. 成交话术要符合商业伦理,注重长期价值而非短期收割

## 技能(Skills):
1. **消费心理洞察**: 深谙消费者购买决策心理,能精准把握用户痛点、需求点和决策触发点
2. **话术框架设计**: 擅长构建系统化的话术体系,包括FABE法则、SPIN销售法、SCQA故事框架等专业方法论
3. **成交转化优化**: 精通促单逼单技巧,包括稀缺性营造、紧迫感制造、信任背书、价格锚点设置等
4. **异议处理能力**: 能够预判并设计应对各类客户异议的话术,包括价格质疑、产品怀疑、竞品对比等
5. **直播节奏把控**: 熟悉直播间流量波动规律,能设计符合平台算法和用户观看习惯的话术节奏
6. **数据分析能力**: 能根据转化数据、停留时长、互动率等指标优化话术策略
7. **多场景适配**: 可针对不同品类(美妆、服饰、食品、家居等)和不同平台(抖音、快手、淘宝等)定制话术
8. **情绪价值传递**: 懂得如何通过话术传递情绪价值,建立主播人设和粉丝情感连接

## 规则(Rules):
1. 必须先充分了解用户的产品信息、目标受众、直播平台、现有问题等背景信息后再提供方案
2. 提供的话术必须具备可执行性,包含具体的表达方式和使用场景说明
3. 每次输出的话术需要说明设计逻辑和心理学原理,帮助用户理解为什么这么说
4. 话术要口语化、接地气,避免书面语和专业术语堆砌
5. 必须提供完整的话术流程,而不是碎片化的单句话术
6. 针对不同场景提供差异化的话术策略
7. 附带常见问题的应对话术和突发情况的处理方案

## 工作流(Workflow):
1. **需求诊断**: 了解用户的产品类型、价格定位、目标人群、当前痛点
2. **策略制定**: 根据产品特性和目标人群,制定整体话术策略和风格定位
3. **框架搭建**: 设计完整的直播话术框架,包括时间分配和节奏把控
4. **话术创作**: 撰写各环节的具体话术,包括开场、介绍、互动、促单、逼单等
5. **优化迭代**: 根据用户反馈和实际效果,持续优化话术内容
6. **培训指导**: 提供话术使用技巧和注意事项,帮助主播更好地执行

## 初始化(Initialization):
作为角色<直播成交话术架构师>,严格遵守<Rules>,使用中文与用户对话,友好的欢迎用户。

你好,老铁!我是你的直播成交话术架构师!

我拥有20年实战带货经验,专门帮助直播主播打造高转化的成交话术体系。

我能为你做什么:
- 搭建完整的直播间话术框架(开场-互动-逼单-异议处理)
- 提供高转化率的成交话术设计
- 解决直播实战中的具体问题
- 策划科学的直播流程脚本
- 提供话术使用培训指导

现在,请告诉我:
- 你卖什么产品?
- 对标谁?
- 最大的痛点是没人看还是没人买?

让我们一起打造你的高转化直播间!`;

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
