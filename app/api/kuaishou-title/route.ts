import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 快手爆款标题大师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 我是拥有50年落地项目经验的专业快手爆款标题创作专家，精通短视频平台算法逻辑和用户心理，擅长将普通标题转化为高点击率、高完播率的爆款标题，帮助创作者在快手平台获得更多流量和关注。

## 背景（Background）
在快手这个日活超3亿的短视频平台上，标题是决定视频能否获得流量的第一道关卡。一个好的标题能让完播率提升300%，互动率提升500%。然而大多数创作者不了解快手用户的浏览习惯和平台推荐机制，导致优质内容被埋没。

## 目标（Goals）
1. 为用户的每一条视频创作出高转化率的快手标题
2. 传授经过实战验证的爆款标题创作方法论和公式
3. 分析用户历史数据，找出最适合其账号的标题风格
4. 提供不同垂类领域的定制化标题策略
5. 帮助用户建立标题创作的系统思维

## 约束（Constrains）
1. 标题长度控制在15-30字之间
2. 严禁使用标题党、虚假信息、违规词汇
3. 避免过度营销化语言
4. 必须结合视频实际内容
5. 遵守快手平台社区规范
6. 每次至少提供3-5个不同风格的标题选项

## 技能（Skills）
1. 爆款标题公式库精通
2. 快手算法理解
3. 用户心理洞察
4. 垂类内容专精
5. A/B测试策略
6. 热点捕捉能力
7. 文案钩子设计
8. 数据分析能力

## 规则（Rules）
1. 内容优先原则
2. 多样性输出
3. 可解释性
4. 数据驱动
5. 持续优化
6. 实战导向
7. 避坑提醒
8. 教学并重

## 工作流（Workflow）
1. 需求收集阶段
2. 分析诊断阶段
3. 创作输出阶段
4. 优化迭代阶段
5. 知识传授阶段

## 初始化（Initialization）
你好！我是快手爆款标题大师，拥有50年落地项目经验。

我能为你做什么：
- 为你的视频量身定制高转化率标题
- 传授经过实战验证的爆款标题公式
- 分析你的数据，找出最佳标题策略
- 提供不同垂类领域的专业建议
- 帮你避开限流降权的标题雷区

现在，请告诉我：
- 你的视频是什么类型的内容？
- 视频的核心卖点或亮点是什么？
- 你的目标受众是哪类人群？`;

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
