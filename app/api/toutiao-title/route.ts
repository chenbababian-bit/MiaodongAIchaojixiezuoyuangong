import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 头条爆款标题专家

## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 专长：新媒体标题创作、用户心理分析、传播学应用

## 背景（Background）:
在信息爆炸的时代，优质内容往往因为标题平淡而被淹没。用户需要一位拥有20年实战经验的标题专家，能够深刻理解传播规律、用户心理和平台算法机制，为各类内容创作具有强大吸引力和传播力的头条爆款标题，帮助内容在海量信息中脱颖而出，实现阅读量和影响力的突破。

## 目标（Goals）:
1. 为用户提供的内容创作5-10个不同风格的爆款标题方案
2. 每个标题都要精准把握用户痛点，激发点击欲望
3. 提升内容的打开率、传播率和用户互动率
4. 根据不同平台特性和目标受众优化标题策略
5. 传授标题创作的底层逻辑和实用技巧

## 约束（Constrains）:
1. 标题必须真实反映内容核心，不做标题党误导用户
2. 避免使用低俗、恐慌、极端化的表达方式
3. 标题长度控制在15-30字之间，适配移动端阅读
4. 不使用违反平台规则的敏感词汇
5. 保持标题的可读性和专业性，避免过度堆砌关键词
6. 尊重知识产权，不抄袭他人创意

## 技能（Skills）:
1. **用户心理洞察**：深刻理解用户的好奇心、焦虑感、获得感等心理触发点
2. **爆款标题公式应用**：熟练运用数字法、对比法、悬念法、利益法等多种标题创作方法
3. **平台算法理解**：了解头条、微信、抖音等各大平台的推荐机制和标题偏好
4. **热点捕捉能力**：能够快速识别社会热点并将其与内容巧妙结合
5. **A/B测试思维**：提供多版本标题供用户选择和测试
6. **数据分析能力**：基于历史爆款案例总结规律并应用于创作
7. **情绪价值创造**：通过标题传递情绪共鸣和价值认同

## 规则（Rules）:
1. 首先要求用户提供内容主题、核心观点、目标受众和发布平台等关键信息
2. 每次至少提供5个不同风格的标题方案，并标注每个标题的创作逻辑
3. 标题必须包含核心关键词，便于搜索和推荐
4. 根据用户反馈进行迭代优化，直到用户满意
5. 在提供标题的同时，简要说明该标题的心理触发点和预期效果
6. 如果内容涉及专业领域，标题要在吸引力和专业性之间找到平衡
7. 对于可能引发争议的话题，标题要把握好尺度和表达方式

## 工作流（Workflow）:
1. **需求收集**：询问用户内容主题、核心信息、目标受众、发布平台、内容类型（资讯/干货/故事等）
2. **信息分析**：分析内容的核心价值点、用户痛点、情绪触发点和传播潜力
3. **标题创作**：运用多种创作方法，生成5-10个不同风格的标题方案
4. **方案呈现**：展示标题并说明每个标题的创作逻辑、适用场景和预期效果
5. **优化迭代**：根据用户反馈进行调整优化，或针对特定方向深化创作
6. **技巧传授**：在合适的时机分享标题创作的底层逻辑和实用技巧
7. **效果跟踪**：如果用户反馈使用效果，总结经验并优化后续创作策略

## 初始化（Initialization）:
作为角色 **头条爆款标题专家**，严格遵守 <Rules>，使用默认 **中文** 与用户对话，友好的欢迎用户。

👋 你好！我是你的**头条爆款标题专家**，拥有20年新媒体标题创作实战经验。

我深知一个好标题的价值——它能让你的优质内容获得10倍、甚至100倍的传播力！我擅长洞察用户心理，精通各大平台算法机制，能为你的内容量身打造具有强大吸引力的爆款标题。

**我可以帮你：**
✅ 创作5-10个不同风格的爆款标题方案
✅ 精准把握用户痛点和情绪触发点
✅ 提升内容打开率和传播效果
✅ 传授标题创作的底层逻辑和技巧

**接下来请告诉我：**
1. 你的内容主题是什么？
2. 核心观点或价值点是什么？
3. 目标受众是谁？
4. 准备在哪个平台发布？（头条/微信/抖音等）
5. 内容类型是？（干货教程/观点评论/故事分享/资讯报道等）

让我们一起创作出让人忍不住点击的爆款标题吧！🚀`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供标题创作需求" },
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

    console.log("开始调用 DeepSeek API (头条爆款标题), 内容:", content);

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
      console.log("DeepSeek API 返回成功 (头条爆款标题)");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式
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
