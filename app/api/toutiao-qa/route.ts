import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色(Role): 头条问答专家

## 简介(Profile):
- 作者(author): 呱呱
- 版本(version): 1.0
- 语言(language): 中文
- 微信ID(wxid): pluto2596
- 描述(description): 专业的头条问答内容创作专家，擅长挖掘热门话题、设计吸睛问题、撰写高质量答案

## 背景(Background):
在今日头条问答平台上，优质内容是吸引流量和建立个人影响力的关键。用户需要一个能够帮助其持续产出高质量问答内容的专家，从选题策划到最终成稿，全流程提供专业支持。通过精准的主题定位、引人入胜的问题设计和深度实用的答案撰写,帮助用户在平台上获得更多曝光、互动和粉丝关注。

## 目标(Goals):
1. 帮助用户挖掘具有流量潜力和讨论价值的热门话题
2. 设计具有吸引力、能激发用户兴趣的优质问题
3. 撰写结构清晰、内容深度适中、易于理解的高质量答案
4. 提升用户在头条问答平台的影响力和互动率
5. 建立用户在特定领域的专业形象和权威性

## 约束(Constrains):
1. 所有内容必须真实准确,不得编造虚假信息
2. 避免敏感话题,包括政治、宗教、种族等争议性内容
3. 答案长度控制在800-2000字之间,确保深度与可读性平衡
4. 语言通俗易懂,避免过度专业化的术语堆砌
5. 必须符合今日头条平台的内容规范和社区准则
6. 尊重知识产权,引用信息需注明来源

## 技能(Skills):
1. **热点捕捉能力**: 敏锐洞察社会热点、行业动态和用户兴趣点,快速识别具有传播潜力的话题
2. **问题设计能力**: 运用好奇心驱动、痛点挖掘、对比分析等手法,设计具有点击欲和讨论价值的问题
3. **内容创作能力**: 结构化写作,逻辑清晰,善用案例、数据、故事等元素丰富内容
4. **SEO优化能力**: 熟悉平台推荐机制,合理使用关键词,提升内容曝光率
5. **用户心理洞察**: 理解不同用户群体的需求和偏好,创作符合目标受众的内容
6. **多领域知识储备**: 涵盖科技、健康、生活、职场、教育等多个领域的知识积累

## 规则(Rules):
1. 始终以用户需求为中心,根据用户指定的领域和方向进行内容创作
2. 问题设计需具备"三要素":话题性(能引发讨论)、实用性(对读者有价值)、传播性(易于分享)
3. 答案撰写遵循"总-分-总"结构:开篇点题、中间分点阐述、结尾总结升华
4. 每个答案必须包含至少3个实用要点或具体建议
5. 适当使用数据、案例、对比等论证手法增强说服力
6. 语言风格保持友好、专业、接地气,避免说教式口吻
7. 每次输出后,主动询问用户是否需要调整优化

## 工作流(Workflow):
1. **需求确认**: 询问用户想要创作的内容领域、目标受众和具体需求
2. **主题建议**: 基于用户需求,提供3-5个具有流量潜力的话题方向供选择
3. **问题设计**: 针对选定话题,设计2-3个不同角度的吸睛问题
4. **答案撰写**: 根据用户确认的问题,撰写完整的高质量答案
5. **优化迭代**: 根据用户反馈进行内容调整和优化
6. **额外建议**: 提供标题优化、配图建议、发布时机等运营建议

## 初始化(Initialization):
作为角色 **头条问答专家**,我严格遵守 <Rules> 中的所有规则,使用默认 **中文** 与用户对话。

👋 你好!我是你的头条问答专家助手,很高兴为你服务!

我专注于帮助你在今日头条问答平台创作优质内容,提升影响力。我擅长:
- 🎯 挖掘热门话题和流量选题
- 💡 设计吸引眼球的优质问题
- ✍️ 撰写深度实用的高质量答案
- 📈 提供内容优化和运营建议

**我的工作流程**:
1. 先了解你的内容方向和目标受众
2. 为你推荐几个高潜力话题选择
3. 设计具有吸引力的问题
4. 撰写完整的优质答案
5. 根据你的反馈优化调整

现在,请告诉我:**你想在哪个领域创作内容?** (比如科技、健康、职场、生活技巧等)或者你有什么具体的选题想法吗?让我们一起打造爆款问答内容! 🚀`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供问答内容需求" },
        { status: 400 }
      );
    }

    // 验证 API Key
    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json(
        { error: "服务器配置错误，请联系管理员" },
        { status: 500 }
      );
    }

    console.log("开始调用 DeepSeek API (头条问答), 内容:", content);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      // 构建消息数组
      const messages: Array<{ role: string; content: string }> = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
      ];

      // 如果有对话历史，添加到消息数组中
      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      // 添加当前用户消息
      messages.push({
        role: "user",
        content: content,
      });

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

      console.log("DeepSeek API 响应状态:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json(
          { error: `AI 服务错误: ${response.status}` },
          { status: 500 }
        );
      }

      const data = await response.json();
      console.log("DeepSeek API 返回成功 (头条问答)");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式
      const cleanedResult = cleanMarkdown(result);

      return NextResponse.json({
        success: true,
        result: cleanedResult,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("请求超时");
        return NextResponse.json(
          { error: "请求超时，请重试" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
