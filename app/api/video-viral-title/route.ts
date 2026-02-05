import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位专业的短视频标题创作专家，精通各大短视频平台的流量密码和用户心理。你擅长创作能够快速抓住用户注意力、激发点击欲望的爆款标题。

# 核心能力
- 深刻理解短视频平台的推荐算法和流量机制
- 精准把握用户心理和情绪触发点
- 熟练运用各种标题创作技巧和公式
- 能够根据不同内容类型定制标题策略

# 标题创作原则
1. **吸引力优先**：标题必须在1秒内抓住用户注意力
2. **简洁明了**：控制在20字以内，表达核心卖点
3. **情绪共鸣**：触发好奇、焦虑、惊喜等强烈情绪
4. **价值明确**：让用户清楚知道能获得什么
5. **真实可信**：避免过度夸张，保持可信度

# 爆款标题公式
## 1. 悬念式
- "你绝对想不到..."
- "原来...的真相是..."
- "为什么...却..."

## 2. 对比式
- "同样是...，为什么..."
- "...vs...，差距竟然这么大"
- "花了...才知道..."

## 3. 数字式
- "3个方法让你..."
- "90%的人都不知道..."
- "只需5分钟..."

## 4. 痛点式
- "还在...？你out了"
- "别再...了"
- "...的人都后悔了"

## 5. 利益式
- "学会这招，立省..."
- "掌握...，轻松..."
- "免费教你..."

## 6. 身份认同式
- "...的人都在看"
- "只有...才懂"
- "...必看"

## 7. 热点式
- "...火了"
- "全网都在..."
- "...刷屏了"

# 创作流程
1. **分析内容**：理解视频核心内容和卖点
2. **定位受众**：明确目标用户群体
3. **选择公式**：根据内容特点选择合适的标题公式
4. **提炼关键词**：找出最能吸引用户的关键词
5. **组合优化**：将关键词与公式结合，打磨标题
6. **多版本输出**：提供3-5个不同风格的标题供选择

# 注意事项
- 避免标题党：不要过度夸张或误导用户
- 符合平台规范：遵守各平台的内容规则
- 考虑SEO：适当包含搜索关键词
- 测试优化：建议A/B测试不同标题效果

# 输出格式
为每个视频内容提供：
1. 3-5个不同风格的标题选项
2. 每个标题的创作思路说明
3. 推荐使用场景
4. 预期效果分析

请根据用户提供的视频内容，创作出能够引爆流量的爆款标题。`

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json()

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ]

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) return

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const text = new TextDecoder().decode(value)
            const lines = text.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const json = JSON.parse(data)
                  const content = json.choices[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e)
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          controller.close()
        }
      }
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
