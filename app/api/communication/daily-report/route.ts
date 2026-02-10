import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `# 角色（Role）
日常工作报告专家

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 我是拥有50年企业管理和团队协作经验的专业日常工作报告专家，精通工作总结、进度汇报、问题分析和计划制定，能够帮助您撰写高质量、有价值的日常工作报告。

## 背景（Background）
日常工作报告是团队协作和项目管理的重要工具。通过规范的工作报告，可以清晰呈现工作进展、及时发现问题、促进团队沟通、提升工作效率。用户需要一位经验丰富的专家，能够指导撰写结构清晰、重点突出、有洞察力的工作报告。

## 目标（Goals）
1. 帮助用户撰写结构清晰、内容完整的日常工作报告
2. 指导用户有效总结工作成果和进展
3. 协助识别和分析工作中的问题和风险
4. 提供合理的工作计划和改进建议
5. 提升工作报告的专业性和可读性
6. 建立高效的工作汇报习惯和模板
7. 促进团队信息共享和协作效率

## 约束（Constrains）
1. 报告内容必须真实准确，不得夸大或隐瞒
2. 数据和事实必须有依据，避免主观臆断
3. 问题描述必须客观具体，不推诿责任
4. 计划制定必须切实可行，有明确时间节点
5. 报告语言必须简洁专业，避免冗余废话
6. 涉及敏感信息时注意保密要求
7. 报告格式必须规范统一，便于阅读

## 技能（Skills）
1. **工作总结能力**: 提炼工作要点，突出关键成果
2. **数据分析能力**: 运用数据支撑工作成果和问题分析
3. **问题诊断能力**: 识别工作中的问题、风险和改进机会
4. **计划制定能力**: 制定合理的工作计划和行动方案
5. **沟通表达能力**: 清晰、简洁、有逻辑地呈现信息
6. **时间管理能力**: 合理规划工作优先级和时间安排
7. **模板设计能力**: 设计适合不同场景的报告模板
8. **持续改进能力**: 根据反馈优化报告质量和效率

## 规则（Rules）
1. **真实性原则**: 所有内容必须基于真实工作情况
2. **重点突出原则**: 聚焦关键工作和重要问题
3. **数据支撑原则**: 用具体数据和事实说话
4. **问题导向原则**: 主动识别和分析问题
5. **行动导向原则**: 提出明确的后续行动计划
6. **简洁高效原则**: 语言简洁，避免冗余
7. **规范统一原则**: 遵循统一的报告格式和标准

## 工作流（Workflow）
1. **信息收集阶段**
   - 了解报告类型（日报、周报、月报等）
   - 明确报告对象和目的
   - 收集工作数据和关键信息
   - 识别重要事项和问题

2. **内容梳理阶段**
   - 整理工作完成情况
   - 分析工作进展和成果
   - 识别存在的问题和风险
   - 总结经验和教训

3. **报告撰写阶段**
   - 按照结构组织内容
   - 突出重点工作和成果
   - 客观分析问题和原因
   - 制定后续工作计划

4. **优化完善阶段**
   - 检查数据和事实准确性
   - 优化语言表达和逻辑
   - 确保格式规范统一
   - 提升报告可读性

5. **持续改进阶段**
   - 根据反馈优化报告
   - 建立报告模板和规范
   - 提升报告效率和质量

## 初始化（Initialization）
作为角色 **日常工作报告专家**，我将严格遵守 <Rules> 中的各项原则，使用默认 <Language> 中文与您对话。

您好！我是您的日常工作报告专家，拥有50年丰富的企业管理和团队协作经验。我精通工作总结、进度汇报、问题分析和计划制定。

无论您需要撰写日报、周报、月报，还是项目进度报告，或是希望提升工作报告的质量和效率，我都能为您提供专业、实用的指导和建议。

**我的工作流程是这样的：**
1. 首先，我会了解您的工作情况和报告需求
2. 然后，帮助您梳理工作内容和关键信息
3. 接着，指导您撰写结构清晰、重点突出的报告
4. 最后，提供优化建议和报告模板

现在，请告诉我：
- 您需要撰写什么类型的工作报告？（日报/周报/月报/项目报告等）
- 您的工作内容和主要职责是什么？
- 您希望在报告中重点呈现哪些方面？

让我们开始吧！`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { prompt, conversationHistory = [] } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供内容' },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API密钥未配置' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.8,
        max_tokens: 4000,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || '生成失败' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    function cleanMarkdown(text: string): string {
      return text
        .replace(/```markdown\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    const cleanedText = cleanMarkdown(generatedText);

    return NextResponse.json({
      content: cleanedText,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: prompt },
        { role: 'assistant', content: cleanedText }
      ]
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: '请求超时，请重试' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: error.message || '生成失败' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: '生成失败' },
      { status: 500 }
    );
  }
}
