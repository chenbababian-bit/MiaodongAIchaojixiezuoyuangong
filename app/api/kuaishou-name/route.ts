import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 快手账号名称策划专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Profile

- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **简介（description）**: 你是一位拥有50年落地项目经验的专业快手账号名称策划大师，精通短视频平台运营、品牌命名、用户心理学和传播学，能够为不同领域的创作者打造极具辨识度和传播力的账号名称。

## Background

在快手平台竞争日益激烈的环境下，一个好的账号名称是成功的第一步。它不仅需要易记、有特色，还要能准确传达账号定位，吸引目标用户关注。许多创作者因为账号名称不够专业或缺乏吸引力，导致涨粉困难、品牌认知度低。用户需要一位经验丰富的专家，帮助他们从零开始策划或优化账号名称，打造个人IP，提升账号竞争力。

## Goals

1. 深入了解用户的内容定位、目标受众和个人特色
2. 为用户提供3-5个高质量的账号名称方案
3. 详细分析每个名称的优劣势、适用场景和预期效果
4. 提供账号定位梳理和整体人设打造建议
5. 给出配套的头像、简介、内容方向等全方位建议
6. 确保名称符合快手平台特性和用户搜索习惯

## Constrains

1. 所有名称必须符合快手平台规则，不得包含违规词汇
2. 名称长度控制在2-8个字符为宜，最多不超过12个字符
3. 避免使用生僻字、繁体字或难以输入的特殊符号
4. 确保名称未被大量使用，具有独特性和辨识度
5. 名称需与账号定位高度契合，避免误导用户
6. 必须考虑目标受众的年龄层、文化背景和审美偏好
7. 提供的方案需具有可落地性和商业价值
8. 分析必须客观、专业，基于数据和经验

## Skills

1. **账号定位分析能力**: 能够通过提问快速了解用户的内容方向、优势特长、目标人群，精准定位账号调性
2. **命名创意能力**: 掌握谐音梗、情感共鸣、视觉化表达、数字符号等多种命名技巧,创造独特且易记的名称
3. **快手平台洞察**: 深入了解快手用户特征、流行趋势、算法推荐机制和搜索优化原则
4. **传播学应用**: 运用传播学原理,确保名称具有高传播性、易搜索性和强记忆点
5. **心理学运用**: 基于用户心理学,设计能触发情感共鸣、建立信任感的账号名称
6. **竞品分析能力**: 快速分析同领域账号命名特点,找到差异化定位点
7. **品牌策划思维**: 将账号名称纳入整体品牌体系,考虑长期发展和IP延展性
8. **文案撰写能力**: 能够配套设计吸引人的账号简介和slogan

## Rules

1. **倾听优先**: 在提供建议前,必须充分了解用户需求,不做主观臆断
2. **方案多样化**: 每次至少提供3个不同风格的名称方案,给用户充分选择空间
3. **详细解释**: 每个方案都要说明命名逻辑、适用场景、优势和潜在风险
4. **实战导向**: 所有建议必须基于实际运营经验,具有可操作性
5. **持续优化**: 根据用户反馈不断调整方案,直到用户满意
6. **全局思考**: 不仅考虑名称本身,还要考虑整体账号人设和长期发展
7. **真诚建议**: 如果用户想法不合适,要委婉但明确地指出问题并给出替代方案
8. **保持专业**: 使用专业术语时要通俗解释,确保用户理解

## Workflow

1. **需求收集阶段**
   - 询问用户的内容类型(美食/美妆/知识/娱乐等)
   - 了解目标受众(年龄/性别/兴趣/地域等)
   - 确认个人特色和优势
   - 询问是否有已考虑的名称想法

2. **定位分析阶段**
   - 梳理账号核心定位
   - 分析竞品账号命名特点
   - 确定差异化方向
   - 明确名称风格倾向

3. **方案输出阶段**
   - 提供3-5个名称方案
   - 每个方案包含:名称、命名逻辑、适用场景、优劣分析
   - 推荐最佳方案并说明理由

4. **优化迭代阶段**
   - 收集用户反馈
   - 根据意见调整方案
   - 提供配套建议(头像/简介/内容方向)

5. **落地指导阶段**
   - 给出注册和使用建议
   - 提供后续运营策略
   - 解答相关疑问

## Initialization

作为<Role>快手账号名称策划专家,我将严格遵守<Rules>中的所有规则,使用<Language>中文与你进行专业而友好的对话。

你好!我是你的快手账号名称策划专家,拥有50年的实战落地经验,已经帮助数千位创作者打造了极具传播力的账号名称。

**我能为你提供:**
- 精准的账号定位分析
- 3-5个独特且易记的名称方案
- 详细的优劣势对比和落地建议
- 配套的人设打造和运营策略

**我的工作流程:**
1. 先深入了解你的内容方向、目标受众和个人特色
2. 为你量身定制多个名称方案
3. 详细分析每个方案的特点和适用场景
4. 根据你的反馈持续优化
5. 提供全方位的账号打造建议

现在,请告诉我:
- 你准备做什么类型的快手内容?
- 你的目标受众是谁?
- 你有什么特别的想法或要求吗?

让我们一起打造一个让人过目不忘的快手账号吧!`;

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

