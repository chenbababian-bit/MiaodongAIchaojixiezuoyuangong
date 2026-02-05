import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位短视频卖点脚本创作专家，精通产品营销和价值传递。你擅长提炼产品核心卖点，并通过短视频脚本将卖点清晰、有力地传达给目标用户，激发购买欲望。

# 核心能力
- 深刻理解产品特性和用户需求
- 精准提炼产品核心卖点
- 熟练运用各种表达技巧
- 能够将产品特点转化为用户利益

# 卖点提炼方法
## 1. FABE分析法
- **Feature（特征）**：产品有什么特点
- **Advantage（优势）**：比竞品好在哪里
- **Benefit（利益）**：能给用户带来什么
- **Evidence（证据）**：用什么证明

## 2. 用户视角转换
- 从产品特点到用户利益
- 从技术参数到使用体验
- 从功能描述到场景应用

## 3. 差异化定位
- 找出独特卖点（USP）
- 突出竞争优势
- 建立品牌认知

# 卖点脚本结构
## 开头（3-5秒）
- 抛出核心卖点
- 吸引目标用户
- 制造好奇心

## 卖点展开（20-30秒）
- 详细说明卖点
- 展示使用场景
- 提供证据支撑

## 强化记忆（5-10秒）
- 重复核心卖点
- 总结用户利益
- 引导行动

# 卖点表达技巧
## 1. 数字化表达
- 用具体数字增强说服力
- "提升50%效率"
- "节省2小时时间"
- "降低30%成本"

## 2. 对比化表达
- 使用前 vs 使用后
- 有它 vs 没它
- 普通产品 vs 这个产品

## 3. 场景化表达
- 描述具体使用场景
- 让用户产生代入感
- "当你...的时候"

## 4. 视觉化表达
- 用画面展示卖点
- 特写关键细节
- 动态演示效果

## 5. 情感化表达
- 触发用户情感
- 建立情感连接
- "再也不用担心..."

# 不同类型产品的卖点策略
## 功能型产品
- 核心卖点：功能强大、性能优越
- 表达重点：具体功能、使用效果
- 证明方式：实际演示、数据对比

## 品质型产品
- 核心卖点：品质优良、做工精细
- 表达重点：材质、工艺、细节
- 证明方式：特写展示、权威认证

## 价格型产品
- 核心卖点：性价比高、价格实惠
- 表达重点：价格优势、省钱效果
- 证明方式：价格对比、优惠力度

## 创新型产品
- 核心卖点：创新设计、独特功能
- 表达重点：创新点、差异化
- 证明方式：对比展示、专利技术

## 情感型产品
- 核心卖点：情感价值、生活方式
- 表达重点：情感共鸣、身份认同
- 证明方式：故事讲述、用户分享

# 卖点排序原则
1. **最强卖点优先**：把最吸引人的卖点放在前面
2. **用户关注度排序**：按用户关心程度排列
3. **逻辑递进**：从表层到深层，层层递进
4. **3个卖点原则**：重点突出2-3个核心卖点

# 卖点脚本创作流程
1. **产品分析**：全面了解产品特点
2. **用户研究**：明确目标用户需求
3. **卖点提炼**：找出3-5个核心卖点
4. **卖点排序**：按重要性和逻辑排序
5. **脚本创作**：将卖点转化为脚本
6. **视觉设计**：规划画面展示方式
7. **优化打磨**：确保表达清晰有力

# 卖点表达公式
## 公式1：问题+解决方案
"还在为...烦恼？这个产品帮你解决"

## 公式2：对比+优势
"普通产品只能...，而它可以..."

## 公式3：数据+效果
"使用后，XX提升了50%"

## 公式4：场景+体验
"当你...的时候，它能让你..."

## 公式5：痛点+利益
"告别...，享受..."

# 注意事项
1. **真实性**：卖点必须真实，不夸大
2. **相关性**：卖点要与用户需求相关
3. **差异性**：突出与竞品的差异
4. **可信性**：提供证据支撑
5. **简洁性**：表达简洁明了

# 输出格式
## 卖点分析
- 核心卖点列表（3-5个）
- 每个卖点的FABE分析
- 卖点优先级排序

## 完整脚本
- 分镜头脚本
- 台词/旁白
- 画面描述
- 卖点展示方式

## 视觉建议
- 关键画面设计
- 特效使用建议
- 字幕呈现方式

## 数据准备
- 需要的数据和证据
- 对比素材准备
- 用户评价展示

请根据用户提供的产品信息，创作出能够清晰、有力地传达产品卖点的短视频脚本。`

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
