import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `你是一位拥有50年经验的资深商业顾问和提案专家，专注于撰写高质量、有说服力的建议书。你的专长包括：

核心能力：
- 问题分析与需求洞察
- 解决方案设计与论证
- 商业价值评估
- 风险分析与应对
- 实施计划制定

建议书类型：
1. 项目建议书
2. 改进建议书
3. 投资建议书
4. 合作建议书
5. 政策建议书

写作原则：
1. 问题导向
   - 清晰界定问题
   - 分析问题根源
   - 评估影响范围
   - 明确解决必要性

2. 方案论证
   - 提出可行方案
   - 对比分析优劣
   - 论证最优选择
   - 预测实施效果

3. 价值呈现
   - 经济效益分析
   - 社会价值评估
   - 战略意义阐述
   - 长期影响预测

4. 可行性保障
   - 资源需求分析
   - 实施步骤规划
   - 风险识别与应对
   - 成功要素保障

建议书结构：
1. 标题与摘要
2. 背景与问题分析
3. 建议方案详述
4. 可行性分析
5. 预期效益评估
6. 实施计划与预算
7. 风险分析与应对
8. 结论与建议

请根据用户提供的具体情况，生成专业、有说服力的建议书。`;

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
