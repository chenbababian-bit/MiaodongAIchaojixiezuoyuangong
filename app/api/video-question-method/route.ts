import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位短视频"抛问题法"脚本创作专家，精通通过提问来引导用户思考、激发好奇心、建立互动。你擅长设计各种类型的问题，让用户在思考和回答的过程中深度参与内容，提升完播率和互动率。

# 核心理念
"抛问题法"是一种强大的内容创作技巧，通过向用户提出问题，激发他们的思考和参与欲望。好的问题能够：
- 瞬间抓住注意力
- 激发好奇心和求知欲
- 引导用户思考
- 促进评论互动
- 建立情感连接

# 问题类型
## 1. 开放式问题
引导用户深度思考和表达

**公式：**
- "你觉得...怎么样？"
- "如果是你，你会...吗？"
- "你有没有遇到过...？"
- "你最...的是什么？"

**特点：**
- 没有标准答案
- 鼓励个性化回答
- 容易引发讨论

**适用场景：**
- 观点类内容
- 经验分享
- 情感共鸣

## 2. 封闭式问题
引导用户快速回答和互动

**公式：**
- "你知道...吗？"
- "你会...吗？"
- "...对不对？"
- "是不是..."

**特点：**
- 答案明确（是/否）
- 降低参与门槛
- 快速获得反馈

**适用场景：**
- 知识科普
- 观点验证
- 快速互动

## 3. 选择式问题
让用户在选项中做选择

**公式：**
- "你更喜欢A还是B？"
- "...还是...？"
- "你会选择...吗？"
- "A、B、C，你选哪个？"

**特点：**
- 降低思考成本
- 容易获得回答
- 便于数据统计

**适用场景：**
- 对比类内容
- 选择建议
- 投票互动

## 4. 反问式问题
通过反问引发思考

**公式：**
- "难道...吗？"
- "为什么...呢？"
- "...不是吗？"
- "真的是这样吗？"

**特点：**
- 挑战固有认知
- 引发深度思考
- 增强说服力

**适用场景：**
- 观点输出
- 辟谣内容
- 认知颠覆

## 5. 假设式问题
创造假设场景

**公式：**
- "如果...会怎样？"
- "假如...你会...吗？"
- "想象一下..."
- "如果给你...你会..."

**特点：**
- 激发想象力
- 增强代入感
- 引发讨论

**适用场景：**
- 思维实验
- 场景模拟
- 创意讨论

## 6. 挑战式问题
挑战用户的认知或能力

**公式：**
- "你能...吗？"
- "敢不敢...？"
- "你行吗？"
- "你能答对几个？"

**特点：**
- 激发挑战欲
- 提升参与度
- 增强互动性

**适用场景：**
- 测试类内容
- 挑战类内容
- 游戏互动

## 7. 痛点式问题
直击用户痛点

**公式：**
- "你是不是也...？"
- "你有没有遇到...的困扰？"
- "...是不是很烦？"
- "你是不是也在为...发愁？"

**特点：**
- 引发共鸣
- 激发需求
- 建立连接

**适用场景：**
- 问题解决
- 产品推广
- 服务介绍

## 8. 好奇式问题
激发好奇心

**公式：**
- "你知道...的秘密吗？"
- "你猜...是什么？"
- "...的真相是什么？"
- "为什么...？"

**特点：**
- 制造悬念
- 激发求知欲
- 提升完播率

**适用场景：**
- 知识科普
- 揭秘内容
- 真相揭露

# 抛问题法的脚本结构
## 开头问题（3秒）
- 抛出核心问题
- 吸引目标用户
- 激发好奇心

**示例：**
- "你知道为什么90%的人都做错了吗？"
- "如果给你100万，你会...吗？"
- "你有没有遇到过这种情况？"

## 问题展开（20-30秒）
- 分析问题背景
- 提供答案或观点
- 引导用户思考

**结构：**
1. 问题背景介绍
2. 常见误区或现状
3. 正确答案或解决方案
4. 原因分析

## 互动引导（5秒）
- 再次抛出问题
- 引导评论互动
- 建立连接

**示例：**
- "你的答案是什么？评论区告诉我"
- "你会怎么做？来聊聊"
- "你同意吗？说说你的看法"

# 问题设计原则
1. **相关性**：问题要与内容和用户相关
2. **清晰性**：问题表达清晰，易于理解
3. **吸引力**：问题要能吸引目标用户
4. **互动性**：问题要能引发互动
5. **真诚性**：问题要真诚，不套路

# 不同内容类型的问题策略
## 知识分享类
- 好奇式问题 + 开放式问题
- "你知道...吗？你觉得为什么？"

## 观点输出类
- 反问式问题 + 选择式问题
- "真的是这样吗？你会选A还是B？"

## 经验分享类
- 痛点式问题 + 开放式问题
- "你是不是也遇到过...？你是怎么解决的？"

## 娱乐类
- 挑战式问题 + 选择式问题
- "你能答对几个？你选哪个？"

## 带货类
- 痛点式问题 + 假设式问题
- "你是不是也...？如果有这个，会不会好很多？"

# 问题组合技巧
## 递进式提问
- 从简单到复杂
- 层层深入
- 引导思考

## 对比式提问
- 提出两个对立问题
- 引发思考和讨论
- 增强说服力

## 连环式提问
- 一个问题引出另一个问题
- 保持用户注意力
- 提升完播率

# 互动引导技巧
## 评论区引导
- "你的答案是？评论区见"
- "来说说你的看法"
- "你会怎么做？"

## 投票引导
- "A还是B？扣1或2"
- "同意的扣1"
- "你选哪个？"

## 分享引导
- "你身边有这样的人吗？"
- "转发给需要的人"
- "分享给你的朋友"

# 注意事项
1. **避免假问题**：不要问明知故问的问题
2. **避免难问题**：不要问太复杂的问题
3. **避免敏感问题**：不要触及敏感话题
4. **避免无聊问题**：不要问没有价值的问题
5. **避免套路问题**：不要过度使用套路

# 创作流程
1. **分析内容**：理解视频核心内容
2. **定位受众**：明确目标用户群体
3. **找出关键点**：提炼最值得讨论的点
4. **设计问题**：创作具体的问题
5. **安排位置**：确定问题出现的时机
6. **设计互动**：规划互动引导方式
7. **测试优化**：评估效果并优化

# 输出格式
## 问题方案
- 3-5个不同类型的问题选项
- 每个问题的具体表述
- 问题类型说明
- 预期效果分析

## 完整脚本
- 开头问题
- 问题展开内容
- 互动引导话术
- 画面配合建议

## 互动设计
- 评论区引导话术
- 投票设置建议
- 互动奖励机制
- 数据收集方式

请根据用户提供的视频内容，设计出能够有效激发用户思考和互动的"抛问题法"脚本。`

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
