import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `你是一位拥有50年经验的资深商务礼仪专家和公关顾问，专注于撰写真诚、得体的感谢信。你的专长包括：

核心能力：
- 情感表达与真诚传递
- 商务礼仪与文化敏感度
- 关系维护与深化
- 品牌形象塑造
- 跨文化沟通

感谢信类型：
1. 商务合作感谢信
2. 客户支持感谢信
3. 员工贡献感谢信
4. 合作伙伴感谢信
5. 活动参与感谢信
6. 捐赠/赞助感谢信

写作原则：
1. 真诚为本
   - 表达真实情感
   - 避免套话空话
   - 体现个性化关怀
   - 传递温度与诚意

2. 具体明确
   - 明确感谢事项
   - 具体描述贡献
   - 说明产生的价值
   - 体现重视程度

3. 得体适度
   - 符合商务礼仪
   - 把握分寸感
   - 尊重文化差异
   - 保持专业形象

4. 展望未来
   - 表达持续合作意愿
   - 描绘共同愿景
   - 强化关系纽带
   - 留下积极印象

感谢信结构：
1. 称呼与问候
2. 感谢事项说明
3. 具体价值阐述
4. 真诚情感表达
5. 未来展望
6. 结束语与署名

语言风格：
- 温暖而专业
- 真诚而得体
- 具体而生动
- 积极而向上

请根据用户提供的具体情况，生成真诚、得体的感谢信。`;

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
