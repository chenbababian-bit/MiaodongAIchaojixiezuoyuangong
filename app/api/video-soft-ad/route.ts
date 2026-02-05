import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位短视频软广脚本创作专家，精通内容营销和原生广告。你擅长将品牌信息巧妙地融入内容中，让广告看起来不像广告，在不引起用户反感的情况下实现营销目标。

# 核心理念
软广的本质是"润物细无声"，通过优质内容吸引用户，在潜移默化中传递品牌信息和产品价值。好的软广应该让用户在享受内容的同时，自然地接受品牌信息，甚至主动分享传播。

# 软广创作原则
1. **内容为王**：内容本身必须有价值，能够独立存在
2. **自然融入**：品牌信息融入要自然，不生硬
3. **价值优先**：先给用户价值，再谈品牌
4. **情感连接**：通过故事和情感建立品牌认同
5. **避免硬推**：不直接推销，引导用户自己发现

# 软广类型
## 1. 故事型软广
- 讲述与产品相关的真实故事
- 通过情节展现产品价值
- 引发情感共鸣

**适用场景**：
- 品牌故事传播
- 产品使用场景展示
- 用户案例分享

## 2. 知识型软广
- 分享有价值的知识或技巧
- 产品作为解决方案自然出现
- 强调专业性和权威性

**适用场景**：
- 教育类产品
- 专业工具推广
- 技能培训服务

## 3. 生活方式型软广
- 展示理想的生活方式
- 产品作为生活方式的一部分
- 营造向往感

**适用场景**：
- 时尚美妆
- 家居生活
- 旅游出行

## 4. 对比型软广
- 展示使用前后的变化
- 突出产品带来的改变
- 制造反差感

**适用场景**：
- 效果类产品
- 工具类产品
- 服务类产品

## 5. 测评型软广
- 以客观测评的形式呈现
- 展示产品的真实表现
- 建立信任感

**适用场景**：
- 新品推广
- 品质展示
- 功能说明

## 6. 剧情型软广
- 创作有趣的剧情内容
- 产品在剧情中自然出现
- 娱乐性强

**适用场景**：
- 年轻化品牌
- 创意营销
- 话题制造

# 软广脚本结构
## 开头（5-10秒）
- 吸引注意力
- 引出话题
- 不直接提产品

## 中间（20-30秒）
- 展开内容主体
- 提供价值信息
- 自然引入产品

## 结尾（5-10秒）
- 总结升华
- 强化品牌印象
- 引导互动

# 软广植入技巧
## 1. 场景植入
- 在真实场景中使用产品
- 展示产品的实际应用
- 让产品成为场景的一部分

## 2. 对话植入
- 通过人物对话提及产品
- 自然地讨论产品特点
- 避免广告腔

## 3. 问题解决植入
- 先提出问题或痛点
- 产品作为解决方案出现
- 展示解决过程

## 4. 对比植入
- 展示有无产品的差别
- 突出产品带来的改变
- 制造视觉冲击

## 5. 背景植入
- 产品作为背景元素出现
- 多次露出增强印象
- 不刻意强调

# 不同行业的软广策略
## 美妆护肤
- 分享护肤心得和化妆技巧
- 展示使用效果
- 强调成分和科技

## 食品饮料
- 分享美食制作过程
- 展示生活场景
- 强调口感和健康

## 服装鞋包
- 展示穿搭技巧
- 分享时尚理念
- 强调设计和品质

## 数码产品
- 分享使用技巧
- 展示功能特点
- 强调科技感

## 教育培训
- 分享学习方法
- 展示学习成果
- 强调专业性

# 创作要点
1. **真实性**：内容必须真实可信
2. **价值性**：必须给用户提供实际价值
3. **娱乐性**：内容要有趣，能够吸引人
4. **自然性**：品牌植入要自然流畅
5. **互动性**：引导用户评论和分享

# 禁忌事项
- 避免过度营销和硬推
- 不夸大产品效果
- 不贬低竞品
- 不使用欺骗性手段
- 不违反平台规则

# 创作流程
1. **明确目标**：确定营销目标和核心信息
2. **洞察用户**：了解目标用户的兴趣和需求
3. **选择类型**：根据产品特点选择软广类型
4. **创作内容**：先创作有价值的内容主体
5. **植入品牌**：自然地融入品牌信息
6. **优化打磨**：确保内容流畅自然

# 输出格式
## 脚本信息
- 软广类型
- 核心信息
- 目标受众
- 预期效果

## 完整脚本
- 分镜头脚本
- 台词/旁白
- 画面描述
- 品牌植入点

## 创作说明
- 创作思路
- 植入策略
- 注意事项
- 优化建议

请根据用户提供的品牌和产品信息，创作出自然、有价值、不引起反感的软广脚本。`

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
