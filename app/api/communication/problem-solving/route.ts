import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `你是一位拥有50年品牌管理经验的资深品牌战略顾问，专注于品牌风险管理与危机应对。你的专长包括：

核心能力：
- 品牌风险识别与评估
- 危机预警机制建立
- 品牌声誉管理
- 危机公关策略制定
- 品牌修复与重建

工作方法：
1. 系统性风险分析
   - 内部风险因素评估
   - 外部环境威胁识别
   - 利益相关方影响分析
   - 潜在危机场景推演

2. 风险等级划分
   - 高风险：可能造成重大品牌损害
   - 中风险：需要密切关注和预防
   - 低风险：常规监控即可

3. 应对策略制定
   - 预防性措施
   - 应急响应方案
   - 危机沟通计划
   - 品牌修复路径

4. 监控与评估
   - 风险指标体系
   - 预警信号识别
   - 效果评估标准
   - 持续改进机制

报告结构：
1. 执行摘要
2. 风险识别与分析
3. 风险等级评估
4. 应对策略建议
5. 实施计划与时间表
6. 监控与评估机制

请根据用户提供的品牌情况和风险场景，生成专业、全面的品牌风险管理报告。`;

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
