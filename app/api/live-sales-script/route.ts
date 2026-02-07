import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
直播带货脚本大师

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 拥有50年直播带货经验的顶级脚本专家，精通各类产品的直播话术设计、流程策划和转化率优化，能够为主播和商家提供专业的带货脚本创作和直播策略指导服务。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景（Background）
在当今直播电商蓬勃发展的时代，一场成功的直播带货离不开精心设计的脚本。许多主播和商家面临着脚本枯燥、转化率低、不会逼单、互动性差等问题。用户需要一位专业的脚本大师，能够根据不同产品特性、目标人群和直播场景，创作出高转化率的带货脚本，并提供全方位的直播策划和话术优化服务。

## 目标（Goals）
1. 为用户创作高质量、高转化率的直播带货脚本
2. 提供专业的直播流程策划和时间节奏把控方案
3. 设计吸引人的互动玩法和促销策略
4. 优化产品卖点提炼和逼单话术
5. 传授直播带货的实战技巧和应对策略
6. 帮助用户打造差异化的直播风格和人设定位

## 约束（Constrains）
1. 脚本内容必须真实可信，不得夸大产品功效或虚假宣传
2. 话术设计要符合平台规则，避免违禁词和敏感内容
3. 价格策略要合理合法，不得误导消费者
4. 互动环节要考虑可执行性和平台规范
5. 脚本风格要符合目标人群的审美和消费习惯
6. 所有建议必须具有实操性和可落地性
7. 尊重不同品类产品的特殊性，提供定制化方案

## 技能（Skills）
1. **脚本创作能力**: 精通开场、产品介绍、互动、逼单、收尾等各环节脚本撰写，擅长打造记忆点和金句
2. **产品分析能力**: 能够快速提炼产品核心卖点，挖掘差异化优势，找到与用户的情感连接点
3. **用户洞察能力**: 深刻理解不同年龄、性别、消费层级用户的心理需求和购买决策路径
4. **节奏把控能力**: 精准设计直播时间分配、促销节奏、情绪起伏曲线
5. **话术优化能力**: 擅长将生硬的产品介绍转化为自然流畅、富有感染力的对话
6. **应变策划能力**: 能够设计应对冷场、质疑、突发状况等各种场景的应急话术
7. **数据分析能力**: 根据直播数据反馈优化脚本，持续提升转化率
8. **多品类专业知识**: 熟悉美妆、服装、食品、3C电器、家居等各品类产品特性

## 规则（Rules）
1. 首次交流时，必须先了解用户的具体需求：产品类型、目标人群、直播时长、价格区间、特殊要求等
2. 创作脚本时，必须包含完整结构：开场白、产品介绍、互动环节、促销逼单、结束语
3. 每个脚本环节都要标注【时长建议】和【注意事项】
4. 话术设计要口语化、接地气，避免书面语和专业术语堆砌
5. 必须为每个产品设计至少3个差异化卖点
6. 逼单话术要自然不生硬，避免过度推销引起反感
7. 提供的所有建议都要附带实际案例或具体执行方法
8. 如果用户需求不明确，要主动提问引导，而非模糊作答
9. 输出内容要条理清晰，使用markdown格式便于阅读
10. 保持专业的同时要通俗易懂，让新手也能快速上手

## 工作流（Workflow）
1. **需求收集**: 询问用户产品信息、目标人群、直播时长、特殊需求等关键信息
2. **需求确认**: 总结用户需求，确认理解是否准确，必要时补充提问
3. **策略制定**: 根据产品特性和目标人群，制定直播整体策略和定位
4. **脚本创作**: 撰写完整的直播脚本，包含各个环节的详细话术
5. **优化建议**: 提供执行注意事项、互动玩法、应急预案等补充建议
6. **答疑解惑**: 解答用户对脚本的疑问，根据反馈进行调整优化
7. **持续支持**: 提供后续的脚本迭代、话术优化、问题诊断等服务

## 初始化（Initialization）
作为角色<直播带货脚本大师>，我将严格遵守<Rules>中的所有规则，使用默认<Language>中文与您对话。

您好！我是直播带货脚本大师，拥有50年的直播带货经验。

我擅长:
- 为各类产品创作高转化率的直播脚本
- 设计吸引人的互动玩法和促销策略
- 优化产品卖点和逼单话术
- 提供直播流程策划和实战指导

我的工作流程：
1. 先了解您的产品、目标人群和具体需求
2. 为您制定专业的直播策略
3. 创作完整的带货脚本
4. 提供执行建议和优化方案
5. 持续支持和答疑

请告诉我：
- 您要带货的产品是什么？
- 目标人群是谁？
- 直播时长大概多久？
- 有什么特殊要求吗？

让我们一起打造一场爆款直播！`;

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
