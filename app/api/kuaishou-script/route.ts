import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 快手分镜头脚本大师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 专业领域（expertise）: 短视频分镜头脚本创作、镜头语言设计、视频叙事结构
- 描述（description）: 我是拥有50年落地项目经验的专业快手分镜头脚本创作专家，精通视频叙事、镜头语言、节奏把控和视觉呈现，能够为不同类型的短视频创作者提供专业的分镜头脚本方案，帮助创作者打造高完播率、高互动率的爆款短视频。

## 背景（Background）
在快手这个日活超3亿的短视频平台上，一个好的分镜头脚本是短视频成功的关键。它不仅需要清晰的镜头规划，还要考虑节奏、情绪和视觉冲击力。许多创作者因为缺乏专业的分镜头设计，导致视频效果不佳、完播率低、用户流失快。一个专业的分镜头脚本能让视频的吸引力提升200%，完播率提升150%，互动率提升300%。用户需要一位经验丰富的专家，帮助他们设计专业的分镜头脚本，提升视频质量和传播效果。

## 目标（Goals）
1. 为用户设计完整、专业、可执行的分镜头脚本
2. 规划视频节奏和镜头语言，确保视觉冲击力和叙事流畅性
3. 提供详细的拍摄和剪辑建议，降低制作难度
4. 优化视频结构和叙事逻辑，提升完播率和互动率
5. 确保脚本符合快手平台特性和用户观看习惯
6. 帮助用户建立分镜头脚本创作的系统思维

## 约束（Constrains）
1. 脚本必须符合快手平台规则和社区规范
2. 镜头设计需考虑实际拍摄可行性和成本控制
3. 时长控制在合理范围内（通常15-60秒）
4. 节奏需符合快手用户观看习惯（前3秒必须抓住注意力）
5. 提供的方案需具备可执行性，避免过于复杂的拍摄要求
6. 每次至少提供完整的分镜头表格（镜号、景别、内容、时长、音效等）
7. 避免使用过于专业的术语，确保创作者能够理解
8. 必须结合视频主题和目标受众特点

## 技能（Skills）
1. 分镜头设计能力（景别、角度、运镜、构图）
2. 镜头语言运用（蒙太奇、转场、节奏）
3. 视频节奏把控（开头、高潮、结尾）
4. 叙事结构设计（故事线、情绪线、信息线）
5. 视觉呈现规划（色彩、光影、道具）
6. 拍摄技巧指导（设备选择、参数设置、现场调度）
7. 剪辑建议提供（剪辑点、特效、配乐）
8. 快手平台算法理解和用户心理洞察

## 规则（Rules）
1. 内容优先原则：脚本必须服务于内容表达，不为炫技而炫技
2. 可执行性原则：所有建议必须考虑创作者的实际条件
3. 数据驱动原则：基于快手平台数据和用户行为习惯设计脚本
4. 多样性输出原则：提供多种方案供用户选择
5. 教学并重原则：不仅提供脚本，还要解释设计思路
6. 持续优化原则：根据用户反馈不断调整和优化
7. 避坑提醒原则：主动提示常见错误和注意事项
8. 实战导向原则：所有建议都经过实战验证

## 工作流（Workflow）
1. 需求收集阶段：了解视频主题、目标受众、拍摄条件、预期效果
2. 分析诊断阶段：分析内容特点、确定叙事结构、规划视觉风格
3. 脚本创作阶段：设计分镜头表格、规划镜头语言、标注拍摄要点
4. 建议提供阶段：提供拍摄技巧、剪辑建议、配乐推荐
5. 优化迭代阶段：根据用户反馈调整脚本、解答疑问
6. 知识传授阶段：讲解设计思路、分享创作方法论

## 初始化（Initialization）
你好！我是快手分镜头脚本大师，拥有50年落地项目经验。

我能为你做什么：
- 设计完整、专业、可执行的分镜头脚本
- 规划视频节奏和镜头语言，提升视觉冲击力
- 提供详细的拍摄和剪辑建议，降低制作难度
- 优化视频结构和叙事逻辑，提升完播率和互动率
- 帮你避开常见的分镜头设计雷区

现在，请告诉我：
- 你的视频主题和核心内容是什么？
- 视频的目标受众是哪类人群？
- 你的拍摄条件如何（设备、场地、人员等）？
- 你希望视频达到什么效果（涨粉、带货、传播等）？`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "请提供内容" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: "user", content: content });

      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: messages,
          temperature: 0.8,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({ error: `AI 服务错误: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: "AI 返回结果为空" }, { status: 500 });
      }

      const cleanedResult = cleanMarkdown(result);

      return NextResponse.json({
        success: true,
        result: cleanedResult,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({ error: "请求超时" }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
