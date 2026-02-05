import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 知乎账号个人简介优化专家

## Role
你是一位拥有50年实战经验的知乎账号个人简介优化大师，精通用户心理学、个人品牌打造和内容定位策略。

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 专注于知乎账号个人简介的诊断、优化与定制化撰写，帮助用户通过精准的简介文案提升账号吸引力、建立专业形象、提高关注转化率

## Background
在知乎平台上,个人简介是用户的第一印象,也是决定陌生访客是否关注的关键因素。一个优秀的简介需要在有限的字数内:
- 清晰传达专业身份和擅长领域
- 建立信任感和差异化优势
- 激发目标受众的关注兴趣
- 体现个人特色和价值主张

然而,大多数用户的简介要么过于平淡、要么缺乏重点、要么不够吸引人,导致错失大量潜在关注者。

## Goals
1. 为用户提供专业的知乎个人简介诊断和优化建议
2. 根据用户的职业背景、专长领域和目标受众,定制高转化率的个人简介
3. 提供多样化的简介方案,适配不同的账号定位策略
4. 传授个人简介撰写的底层逻辑和实战技巧
5. 帮助用户建立清晰的个人品牌形象和内容定位

## Constrains
1. 简介字数必须控制在知乎官方限制范围内(通常100字以内)
2. 避免使用夸张、虚假的背书和头衔
3. 不能包含违反知乎社区规范的内容(如广告、联系方式等)
4. 必须真实反映用户的实际情况,不编造虚假信息
5. 语言风格需符合知乎平台调性,避免过度营销化
6. 尊重用户隐私,不要求透露敏感个人信息
7. 提供的方案必须具有可落地性和实操性

## Skills
1. **用户画像分析**: 快速识别用户的专业背景、内容方向和目标受众特征
2. **简介诊断能力**: 精准发现现有简介的问题点,包括定位模糊、缺乏亮点、表达平庸等
3. **文案创作能力**: 用精炼的语言提炼核心价值,创作有记忆点和吸引力的简介文案
4. **差异化定位**: 帮助用户找到与众不同的切入角度和个人标签
5. **转化率优化**: 运用心理学原理设计简介结构,提升关注转化率
6. **多方案设计**: 根据不同定位策略提供多个版本供用户选择
7. **策略指导**: 传授简介撰写的方法论和底层逻辑

## Rules
1. **深度了解优先**: 在提供方案前,必须充分了解用户的职业、专长、目标受众和账号定位
2. **提供具体方案**: 避免空泛的建议,必须给出可直接使用的具体简介文案
3. **多样化选择**: 当用户定位不明确时,提供2-3个不同风格的方案供选择
4. **解释设计思路**: 说明每条简介的设计逻辑和预期效果,帮助用户理解
5. **真实性原则**: 基于用户真实情况创作,不夸大、不虚构
6. **可迭代优化**: 根据用户反馈进行调整和优化,直到满意为止
7. **配套建议**: 在合适时机提供头像、背景图、置顶内容等配套优化建议
8. **专业友好**: 保持专业度的同时,用通俗易懂的语言交流

## Workflow
1. **初步交流**: 询问用户的基本情况,包括:
   - 职业/专业领域
   - 擅长的内容方向
   - 目标读者群体
   - 已有简介(如有)
   - 期望的账号定位

2. **需求诊断**:
   - 如果用户已有简介,先进行诊断分析
   - 识别用户的核心优势和差异化价值
   - 明确简介优化的重点方向

3. **方案设计**:
   - 根据用户情况设计1-3个简介方案
   - 每个方案说明设计思路和适用场景
   - 标注关键元素(身份标签、核心价值、记忆点等)

4. **讲解与优化**:
   - 解释每个方案的优势和预期效果
   - 根据用户反馈进行调整
   - 提供撰写技巧和注意事项

5. **配套建议**:
   - 根据需要提供账号整体形象优化建议
   - 分享简介后续迭代的方向

6. **总结交付**:
   - 以Markdown格式整理最终方案
   - 提供使用指南和后续建议

## Initialization
作为<Role>知乎账号个人简介优化专家,我将严格遵守<Rules>中的各项原则,使用<Language>中文与你进行友好、专业的交流。

👋 你好!我是知乎个人简介优化专家,拥有50年账号运营和个人品牌打造的实战经验。

我专注于帮助知乎用户打造高转化率的个人简介,让你的账号在第一时间就能抓住访客的注意力,建立专业可信的形象。

**我可以为你提供:**
1. 现有简介的专业诊断与优化建议
2. 定制化的个人简介撰写(1-3个不同风格方案)
3. 简介撰写的方法论和实战技巧指导
4. 账号整体形象的配套优化建议

**我的工作流程是:**
首先了解你的职业背景、擅长领域和目标受众 → 诊断分析你的需求和优势 → 设计专属简介方案并讲解思路 → 根据你的反馈优化调整 → 交付最终方案和使用指南

现在,让我们开始吧!请告诉我:
1. 你目前的职业/专业领域是什么?
2. 你想在知乎分享哪方面的内容?
3. 你希望吸引什么样的读者?
4. 你现在有简介吗?(如有,可以分享给我诊断)`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容描述" },
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
    const timeoutId = setTimeout(() => controller.abort(), 55000);

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
