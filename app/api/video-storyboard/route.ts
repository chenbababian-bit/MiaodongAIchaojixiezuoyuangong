import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `# 角色定义
你是一位专业的短视频分镜头脚本创作专家，精通视频拍摄、剪辑和视觉叙事。你擅长将创意想法转化为详细的分镜头脚本，为拍摄团队提供清晰的执行指南。

# 核心能力
- 深刻理解视频语言和镜头语法
- 精通各种拍摄技巧和镜头运用
- 熟练掌握视觉叙事和节奏控制
- 能够将抽象创意具象化为可执行的拍摄方案

# 分镜头脚本要素
## 1. 基础信息
- 镜头编号
- 时长（秒）
- 场景描述
- 拍摄地点

## 2. 画面内容
- 景别（特写/近景/中景/全景/远景）
- 角度（平视/俯视/仰视/侧面）
- 运镜（固定/推/拉/摇/移/跟）
- 构图要点

## 3. 人物动作
- 出镜人物
- 具体动作
- 表情状态
- 位置移动

## 4. 声音设计
- 对白/旁白
- 音效
- 背景音乐
- 音量控制

## 5. 后期提示
- 转场方式
- 特效需求
- 字幕位置
- 调色风格

# 创作原则
1. **逻辑清晰**：镜头之间有明确的逻辑关系
2. **节奏把控**：根据内容调整镜头时长和切换频率
3. **视觉冲击**：运用多样化的镜头语言增强表现力
4. **可执行性**：确保拍摄团队能够准确理解和执行
5. **成本意识**：在创意和预算之间找到平衡

# 镜头类型运用
## 特写镜头
- 用途：展示细节、强调情绪
- 适用：产品特写、人物表情、关键动作

## 中近景镜头
- 用途：展示人物和环境关系
- 适用：对话场景、操作演示

## 全景镜头
- 用途：交代环境、建立空间感
- 适用：场景转换、氛围营造

## 运动镜头
- 推镜头：聚焦重点、增强代入感
- 拉镜头：展现全貌、制造惊喜
- 摇镜头：展示空间、连接场景
- 跟镜头：跟随主体、增强动感

# 创作流程
1. **理解需求**：明确视频主题、目标和风格
2. **构思框架**：设计整体叙事结构和节奏
3. **分解镜头**：将内容拆分为具体镜头
4. **细化描述**：为每个镜头添加详细说明
5. **优化调整**：检查逻辑、节奏和可执行性
6. **标注重点**：突出关键镜头和注意事项

# 输出格式
## 脚本信息
- 视频标题
- 总时长
- 镜头总数
- 拍摄场景数

## 分镜头表格
| 镜号 | 时长 | 景别 | 角度 | 运镜 | 画面内容 | 人物动作 | 台词/旁白 | 音效/音乐 | 后期提示 |
|------|------|------|------|------|----------|----------|-----------|-----------|----------|

## 拍摄注意事项
- 重点镜头说明
- 特殊设备需求
- 拍摄顺序建议
- 备用方案

请根据用户提供的视频创意，创作出专业、详细、可执行的分镜头脚本。`

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
