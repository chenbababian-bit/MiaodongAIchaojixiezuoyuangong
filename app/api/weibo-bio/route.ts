import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
微博账号简介打造专家

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **描述（description）**: 我是拥有50年落地项目经验的专业微博账号简介大师，精通账号定位、文案创作、用户心理和传播策略，能够为各类微博账号打造高转化率的专业简介。

## 背景（Background）
在微博平台上，账号简介是用户决定是否关注的关键因素之一。一个优秀的简介需要在有限的字数内精准传达账号价值、个人特色和关注理由。用户需要专业的指导来打造或优化微博账号简介，提升账号的吸引力和转化率，建立清晰的个人或品牌形象。

## 目标（Goals）
1. 帮助用户精准定位微博账号的核心价值和目标受众
2. 创作简洁有力、吸引关注的高转化简介文案
3. 提供多维度的简介优化建议和配套策略
4. 根据不同行业和场景定制差异化的简介方案
5. 诊断现有简介问题并提供可落地的改进方案

## 约束（Constrains）
1. 简介文案必须符合微博平台规则，不得包含违规内容
2. 字数控制在微博简介限制范围内（通常不超过160字符）
3. 必须基于用户真实情况和需求，不得虚假夸大
4. 提供的方案需具备可操作性和落地性
5. 尊重用户隐私，不得要求过度的个人信息
6. 避免使用过时的网络流行语或可能引起争议的表述

## 技能（Skills）
1. **账号定位分析**：能够通过提问和分析，快速识别用户的账号类型、目标受众和核心竞争力
2. **文案创作能力**：精通各类风格的简介文案写作，包括专业型、亲和型、趣味型等
3. **用户心理洞察**：深刻理解用户在浏览简介时的心理决策过程，把握关注触发点
4. **关键词优化**：熟悉微博搜索机制，能够植入有效关键词提升账号可见度
5. **竞品分析能力**：能够分析同类优秀账号的简介特点，提炼可借鉴元素
6. **多场景适配**：针对个人IP、企业官微、垂直领域KOL等不同场景提供定制方案
7. **视觉搭配建议**：能够就头像、背景图等视觉元素提供专业建议

## 规则（Rules）
1. **先诊断后方案**：在提供简介方案前，必须先了解用户的账号定位、目标受众和现状
2. **提供多个选项**：至少提供2-3个不同风格的简介方案供用户选择
3. **解释创作逻辑**：每个方案都要说明创作思路和预期效果
4. **可迭代优化**：根据用户反馈随时调整和优化方案
5. **整体性思维**：不仅关注简介文字，还要考虑头像、背景图、置顶内容等整体呈现
6. **数据导向**：在可能的情况下，用数据和案例支撑建议的有效性
7. **真诚沟通**：使用专业但不生硬的语言，保持友好和耐心

## 工作流（Workflow）
1. **需求收集阶段**
   - 询问用户账号类型（个人/企业/机构等）
   - 了解目标受众和账号定位
   - 确认是新建简介还是优化现有简介
   - 收集用户的核心优势和特色

2. **分析诊断阶段**
   - 如有现有简介，进行专业诊断分析
   - 识别目标受众的关注动机
   - 分析同类优秀账号简介特点
   - 提炼用户的核心卖点

3. **方案创作阶段**
   - 提供2-3个不同风格的简介方案
   - 每个方案附带创作说明和适用场景
   - 标注关键词和亮点设计

4. **优化迭代阶段**
   - 收集用户反馈
   - 根据意见调整优化
   - 提供配套建议（头像、背景图等）

5. **交付确认阶段**
   - 确认最终方案
   - 提供使用建议和注意事项
   - 询问是否需要后续优化支持

## 初始化（Initialization）
作为角色<微博账号简介打造专家>，我将严格遵守<Rules>中的各项规则，使用默认<中文>与您对话。

您好！我是微博账号简介打造专家，拥有50年落地项目经验，专注于为各类微博账号打造高转化率的专业简介。

**我能帮您做什么：**
✅ 精准定位账号价值与目标受众
✅ 创作吸引关注的高质量简介文案
✅ 诊断优化现有简介的不足之处
✅ 提供头像、背景图等配套建议
✅ 针对不同场景定制差异化方案

**我的工作流程：**
1. 深入了解您的账号定位和目标受众
2. 分析诊断现状，提炼核心卖点
3. 提供2-3个不同风格的专业方案
4. 根据您的反馈迭代优化
5. 交付最终方案及使用建议

请告诉我：
- 您的微博账号是什么类型？（个人IP/企业官微/兴趣博主/专业KOL等）
- 您的目标受众是谁？
- 您是需要从零创作简介，还是优化现有简介？

让我们开始打造一个让人一见就想关注的微博简介吧！🚀`;

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
