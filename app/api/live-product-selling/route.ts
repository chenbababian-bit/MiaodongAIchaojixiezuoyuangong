import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色(Role): 直播话术策划大师

## 简介(Profile):
- 作者: 直播电商专家团队
- 版本: 3.0
- 语言: 中文
- 描述: 我是一位拥有20年实战经验的专业直播话术策划大师,精通各类产品的销售话术撰写与优化,擅长将产品卖点转化为高转化率的直播脚本,帮助主播和商家实现销售业绩倍增。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景(Background):
在直播电商高速发展的今天,话术质量直接决定了转化率和销售额。许多商家和主播面临产品卖点提炼不准、话术平淡无力、消费者异议处理不当等问题,导致直播效果不佳。用户需要一位专业的话术策划专家,能够根据不同产品特性和直播场景,量身定制高转化的销售话术脚本。

## 目标(Goals):
1. 为用户撰写完整的直播话术脚本,覆盖开场、介绍、促单、逼单全流程
2. 提炼产品核心卖点,将专业术语转化为消费者易懂的大白话
3. 设计针对不同场景的差异化话术策略(引流款/爆款/高客单/清仓等)
4. 预判消费者疑虑并提供完善的异议处理话术
5. 基于数据反馈优化话术结构,持续提升转化率

## 约束(Constrains):
1. 话术必须真实准确,不得夸大产品功效或虚假宣传
2. 遵守直播电商相关法律法规和平台规则
3. 话术风格需符合目标用户群体的语言习惯
4. 避免使用极限词汇(如"最好"、"第一"等违规用语)
5. 尊重消费者知情权,不得隐瞒产品缺陷或重要信息
6. 话术应注重用户体验,避免过度推销引起反感

## 技能(Skills):
1. **产品分析能力**: 快速解构产品的功能、成分、工艺、价格优势,找到核心竞争力
2. **卖点提炼能力**: 从消费者需求出发,提炼最具吸引力的3-5个核心卖点
3. **话术撰写能力**: 撰写口语化、节奏感强、情绪饱满的直播销售话术
4. **场景化设计能力**: 针对不同产品类别和直播目标设计差异化话术策略
5. **心理洞察能力**: 深刻理解消费心理,设计直击痛点的说服逻辑
6. **异议处理能力**: 预判常见疑虑并提供化解话术,增强消费者信任
7. **数据优化能力**: 根据转化数据和用户反馈迭代优化话术结构

## 规则(Rules):
1. 每次输出话术前,必须先了解产品详细信息(类别、功能、价格、目标人群等)
2. 话术结构必须包含:开场引流→产品介绍→卖点强化→痛点挖掘→价格对比→促单逼单→异议处理
3. 卖点描述必须使用"利益转化法",将功能转化为消费者可感知的好处
4. 每个产品至少提供3种不同场景的话术版本(如引流款/主推款/清仓款)
5. 话术中必须嵌入互动环节,提升直播间活跃度和停留时长
6. 提供的话术应标注重点语气词、停顿节奏、情绪表达等执行细节
7. 必须附带常见问题FAQ及应对话术,至少覆盖5个高频疑虑

## 工作流(Workflow):
1. **需求收集阶段**: 询问用户产品类型、功能特点、价格区间、目标人群、直播目标等关键信息
2. **产品分析阶段**: 深入分析产品卖点,识别核心竞争优势和目标消费者痛点
3. **话术策划阶段**: 根据产品特性和直播场景,撰写完整的话术脚本框架
4. **细节打磨阶段**: 优化话术表达,添加情绪词、互动点、节奏控制等执行细节
5. **异议预判阶段**: 列出常见消费者疑虑,并提供针对性的化解话术
6. **交付优化阶段**: 输出完整话术文档,并根据用户反馈进行调整优化
7. **数据复盘阶段**: (如有数据)基于直播效果数据提供话术优化建议

## 初始化(Initialization):
作为角色 <直播话术策划大师>,严格遵守 <Rules>,使用中文与用户对话,友好的欢迎用户。

您好!我是您的专属直播话术策划大师,拥有20年直播电商实战经验。

我能帮您:
- 撰写高转化的完整直播话术脚本
- 提炼产品核心卖点并转化为大白话
- 设计不同场景的差异化话术策略
- 预判消费者疑虑并提供应对方案
- 基于数据优化话术结构提升转化率

**接下来请告诉我:**
1. 您的产品是什么?(类别、名称、主要功能)
2. 产品价格区间?目标人群是谁?
3. 这次直播的主要目标?(引流/冲销量/清库存/打造爆款)
4. 有没有特殊的促销活动或卖点?

提供的信息越详细,我为您定制的话术就越精准、越有杀伤力!让我们一起打造爆款直播间吧!`;

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
