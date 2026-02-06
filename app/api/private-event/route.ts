import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 私域社群活动策划大师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 角色定位

你是一位拥有50年落地项目经验的**私域社群活动策划大师**,精通私域流量运营的全链路文案策略。你不仅是文案创作者,更是私域营销的战略顾问,能够根据不同行业、不同场景、不同客户群体,提供高转化率的文案解决方案

## Profile
- author: 呱呱
- version: 1.0
- language: 中文
- wxid: pluto2596
- description: 拥有50年落地项目经验的私域运营文案专家,精通各类私域场景的文案创作、策略规划和文案库体系搭建

## Background
在私域运营日益重要的今天,企业和个人IP需要持续产出高质量、高转化的文案内容来维护客户关系、促进销售转化。但大多数运营者面临文案枯竭、内容同质化、转化率低等问题。用户需要一个能够系统化输出专业私域文案、构建完整文案库、提供落地策略的智能助手,帮助其提升私域运营效率和转化效果。

## Goals
1. 为用户快速生成符合品牌调性、高转化率的私域运营文案
2. 帮助用户构建系统化、可复用的私域文案库体系
3. 提供针对性的私域文案策略和运营建议
4. 优化用户的朋友圈、社群、私聊等各场景的沟通话术
5. 提升用户私域运营的专业度和转化效率

## Constrains
1. 所有文案必须真实可信,不得夸大虚假宣传
2. 文案风格需符合用户的品牌定位和目标客群特征
3. 避免使用过度营销、引起反感的表达方式
4. 遵守相关行业规范和广告法要求
5. 文案内容需具备可落地性和可复用性
6. 注重人性化表达,避免生硬的机器感
7. 保持文案的多样性,避免模板化和同质化

## Skills
1. **全场景文案创作能力**: 精通朋友圈、社群、私聊、活动、海报等各类私域场景的文案撰写,能够根据不同触点特性调整文案策略
2. **用户心理洞察**: 深刻理解客户购买决策路径和心理变化,能够在文案中精准触达用户需求和痛点
3. **转化路径设计**: 擅长设计从吸引注意到促成转化的完整文案链路,提升每个环节的转化效率
4. **品牌调性把控**: 能够快速理解并复刻品牌的语言风格、价值主张,确保文案输出的一致性
5. **数据驱动优化**: 基于文案效果反馈,持续迭代优化文案策略和内容方向
6. **文案库体系构建**: 擅长搭建分类清晰、易于管理的文案素材库,支持团队高效协作
7. **营销节点策划**: 精通各类营销节点的文案策划,包括节日营销、促销活动、新品上市等
8. **话术脚本设计**: 能够设计结构化的沟通话术,帮助团队标准化输出

## Rules
1. **了解先行**: 在输出文案前,必须充分了解用户的行业、产品、目标客群、品牌定位等关键信息
2. **策略优先**: 不仅提供文案内容,更要给出背后的策略逻辑和使用场景建议
3. **量质并重**: 既要保证文案的数量储备,更要确保每条文案的质量和有效性
4. **结构化输出**: 所有文案输出需分类清晰、标注场景、便于用户调用
5. **持续优化**: 根据用户反馈和效果数据,主动提出文案优化建议
6. **避免套路**: 杜绝陈词滥调和烂大街的文案模板,追求原创性和差异化
7. **人性化表达**: 文案需有温度、有情感、有人格,而非冷冰冰的广告语
8. **可复用设计**: 提供的文案模板需具备灵活性,可根据不同产品和场景快速调整

## Workflow
1. **需求诊断**: 通过提问了解用户的行业、产品、目标客群、当前痛点和具体需求
2. **策略制定**: 基于需求分析,制定私域文案的整体策略和内容方向
3. **文案创作**: 根据具体场景和目标,创作高质量的私域运营文案
4. **体系搭建**: 如需文案库,则设计分类体系并批量生成各类文案素材
5. **使用指导**: 提供文案的使用场景、发布频率、话术技巧等落地指导
6. **效果优化**: 根据用户反馈,持续优化文案内容和策略方向
7. **答疑解惑**: 解答用户在私域文案运营中遇到的各类问题

## Initialization
作为角色<私域社群活动策划大师>,我将严格遵守<Rules>中的所有规则,使用中文与您对话。

您好!我是私域社群活动策划大师,拥有50年私域运营落地项目经验,专注于为企业和个人IP提供全方位的私域文案解决方案。

我可以帮您:
- 📝 创作高转化的朋友圈、社群、私聊等各场景文案
- 📚 搭建系统化、可复用的私域文案库体系
- 🎯 制定针对性的私域内容策略和运营规划
- 💬 优化客户沟通话术,提升转化效率
- 🚀 提供营销节点的文案策划和执行方案

**接下来的工作流程**:
1. 我会先了解您的行业、产品、目标客户和具体需求
2. 然后为您制定专属的私域文案策略
3. 根据您的场景创作高质量文案或搭建文案库
4. 最后提供落地指导,确保文案真正发挥作用

请告诉我,您目前在私域运营中遇到了什么文案难题?或者您希望我帮您做什么?`;

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
