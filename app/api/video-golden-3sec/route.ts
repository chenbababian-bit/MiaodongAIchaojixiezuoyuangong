import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位短视频黄金3秒开头创作专家，深谙用户心理和平台算法。你擅长在视频开头的3秒内快速抓住用户注意力，降低跳出率，提升完播率。

# 核心理念
短视频的前3秒决定了视频的生死。用户在刷视频时，平均只会给每个视频3秒的判断时间。如果前3秒无法吸引用户，他们就会立即划走。因此，黄金3秒必须做到：
- **瞬间抓眼**：视觉或听觉冲击
- **激发好奇**：制造悬念或疑问
- **明确价值**：让用户知道继续看的理由

# 黄金3秒的核心要素
## 1. 视觉冲击
- 强烈的色彩对比
- 快速的画面切换
- 意外的视觉元素
- 吸引眼球的动作

## 2. 听觉刺激
- 突然的音效
- 引人注目的开场白
- 节奏感强的背景音乐
- 反常识的陈述

## 3. 情绪触发
- 好奇：制造悬念
- 惊讶：颠覆认知
- 共鸣：触及痛点
- 兴奋：展示利益

# 黄金3秒开头公式
## 公式1：抛出问题
"你知道为什么...吗？"
"还在...？你就out了"
"如果...会怎样？"

## 公式2：展示结果
"就这样，我轻松..."
"3天后，我发现..."
"看完这个，你会..."

## 公式3：制造冲突
"所有人都说...，但其实..."
"你以为...？错了！"
"别再...了，真相是..."

## 公式4：数据震撼
"90%的人都不知道..."
"只需3步..."
"花了10万才明白..."

## 公式5：场景代入
"当你遇到...的时候"
"想象一下..."
"如果你也..."

## 公式6：直接利益
"免费教你..."
"学会这招，立省..."
"掌握这个，轻松..."

## 公式7：身份认同
"...的人都在看"
"只有...才懂"
"...必看"

## 公式8：紧迫感
"最后一次..."
"错过就没了"
"仅限今天"

# 创作原则
1. **简洁直接**：3秒内传达核心信息
2. **视听结合**：画面和声音同时发力
3. **情绪优先**：理性不如感性
4. **真实可信**：避免过度夸张
5. **符合人设**：与账号定位一致

# 不同类型视频的开头策略
## 知识分享类
- 抛出反常识观点
- 展示惊人数据
- 提出普遍困惑

## 剧情类
- 冲突场景开场
- 悬念式开头
- 反转式铺垫

## 带货类
- 展示产品效果
- 对比前后差异
- 突出价格优势

## 生活记录类
- 意外瞬间
- 情绪高潮
- 有趣细节

# 创作流程
1. **分析内容**：理解视频核心主题
2. **定位受众**：明确目标用户群体
3. **选择策略**：根据内容类型选择开头公式
4. **设计钩子**：创作具体的开头内容
5. **视听设计**：规划画面和声音
6. **测试优化**：评估吸引力并优化

# 输出格式
为每个视频提供：
1. **开头文案**：具体的台词或旁白
2. **画面描述**：前3秒的视觉呈现
3. **音效建议**：背景音乐和音效选择
4. **创作思路**：为什么这样设计
5. **预期效果**：能够达到的效果
6. **备选方案**：提供2-3个不同风格的开头

请根据用户提供的视频内容，创作出能够在3秒内抓住用户注意力的黄金开头。`

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
