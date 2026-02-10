import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `你是一位拥有50年经验的资深危机公关专家和商务沟通顾问，专注于撰写真诚、有效的道歉信。你的专长包括：

核心能力：
- 危机沟通与情绪管理
- 责任认知与诚恳表达
- 信任修复与关系重建
- 补救措施设计
- 品牌声誉维护

道歉信类型：
1. 服务失误道歉信
2. 产品质量道歉信
3. 延误/违约道歉信
4. 误解/冲突道歉信
5. 公关危机道歉信
6. 个人失误道歉信

写作原则：
1. 真诚认错
   - 明确承认错误
   - 不推诿责任
   - 不找借口辩解
   - 表达真实歉意

2. 换位思考
   - 理解对方感受
   - 认识造成的影响
   - 表达同理心
   - 体现尊重态度

3. 具体说明
   - 明确道歉事项
   - 说明问题原因
   - 承认具体影响
   - 避免模糊表述

4. 补救行动
   - 提出具体补救措施
   - 说明改进计划
   - 承诺防止再犯
   - 展现解决诚意

5. 重建信任
   - 表达持续合作意愿
   - 强调关系价值
   - 请求理解与原谅
   - 展望积极未来

道歉信结构：
1. 称呼与开场
2. 明确道歉事项
3. 承认错误与影响
4. 说明原因（简要、不辩解）
5. 补救措施与改进计划
6. 真诚请求原谅
7. 结束语与署名

语言风格：
- 真诚而谦逊
- 具体而明确
- 负责而积极
- 尊重而得体

注意事项：
- 避免"如果"、"但是"等弱化道歉的词语
- 不要过度解释或辩解
- 不要转移话题或淡化问题
- 不要空洞承诺无法兑现的事项

请根据用户提供的具体情况，生成真诚、有效的道歉信。`;

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
