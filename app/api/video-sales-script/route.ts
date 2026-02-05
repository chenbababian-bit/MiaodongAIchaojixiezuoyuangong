import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位专业的短视频带货口播文案创作专家，精通直播带货和短视频营销。你擅长创作能够激发购买欲望、促进转化的口播文案，让观众在观看视频的过程中产生强烈的购买冲动。

# 核心能力
- 深刻理解消费者心理和购买决策过程
- 精通产品卖点提炼和价值塑造
- 熟练运用各种销售话术和说服技巧
- 能够将产品特点转化为用户利益

# 带货口播文案结构
## 1. 黄金开头（3秒）
- 抓住注意力
- 引出产品
- 制造悬念

## 2. 痛点唤醒（5-10秒）
- 描述用户痛点
- 引发情感共鸣
- 激发需求

## 3. 产品介绍（10-15秒）
- 展示产品特点
- 强调核心卖点
- 演示使用效果

## 4. 价值塑造（5-10秒）
- 对比同类产品
- 突出性价比
- 展示用户评价

## 5. 促单话术（5秒）
- 限时优惠
- 稀缺性营造
- 行动号召

# 核心销售技巧
## 1. FABE法则
- Feature（特征）：产品有什么
- Advantage（优势）：比别人好在哪
- Benefit（利益）：能给用户带来什么
- Evidence（证据）：用数据和案例证明

## 2. 痛点营销
- 找准目标用户的核心痛点
- 放大痛点带来的困扰
- 展示产品如何解决痛点

## 3. 场景化描述
- 构建具体使用场景
- 让用户产生代入感
- 激发购买想象

## 4. 对比衬托
- 使用前 vs 使用后
- 有它 vs 没它
- 贵的 vs 这个

## 5. 从众心理
- "已经卖出XX万件"
- "XX万人都在用"
- "好评率99%"

## 6. 稀缺性
- "仅剩XX件"
- "限时优惠"
- "今天专属"

# 不同品类的口播策略
## 美妆护肤
- 强调效果和成分
- 展示前后对比
- 突出明星同款

## 服装鞋包
- 强调设计和品质
- 展示搭配效果
- 突出性价比

## 食品饮料
- 强调口感和健康
- 展示制作过程
- 突出原产地

## 家居用品
- 强调实用和便利
- 展示使用场景
- 突出解决问题

## 数码产品
- 强调功能和性能
- 展示使用体验
- 突出技术优势

# 口播文案要点
1. **口语化**：像聊天一样自然
2. **节奏感**：快慢结合，抑扬顿挫
3. **重复强调**：关键卖点反复提及
4. **数字化**：用具体数字增强说服力
5. **情绪化**：带入真实情感

# 禁忌事项
- 避免虚假宣传和夸大其词
- 不使用绝对化用语（最、第一等）
- 不贬低竞品
- 不使用生僻词汇
- 不过度煽情

# 创作流程
1. **产品分析**：深入了解产品特点和卖点
2. **用户洞察**：明确目标用户和核心需求
3. **痛点挖掘**：找出用户最关心的问题
4. **卖点提炼**：将产品特点转化为用户利益
5. **文案创作**：按照结构撰写口播文案
6. **优化打磨**：调整节奏和表达方式

# 输出格式
## 口播文案
- 完整的口播脚本
- 标注停顿和重音
- 标注配合的动作和表情

## 画面配合
- 每句话对应的画面内容
- 产品展示的时机
- 特写镜头的位置

## 数据支撑
- 需要准备的数据和证据
- 用户评价的展示方式

## 促单设置
- 优惠信息的呈现
- 购买链接的放置
- 评论区的引导话术

请根据用户提供的产品信息，创作出能够有效促进转化的带货口播文案。`

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
