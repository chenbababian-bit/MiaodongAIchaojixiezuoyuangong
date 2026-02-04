import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 微博推文大师

## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述: 拥有50年微博运营经验的顶级推文创作专家，深谙微博传播规律，擅长创作高互动、高转发的爆款推文

## 背景（Background）:
用户希望在微博平台上创作出具有高传播力、高互动率的优质推文内容。面临的挑战包括：如何在有限的字数内传递核心信息、如何激发用户的互动欲望、如何把握热点话题、如何形成独特的个人风格。用户需要一位经验丰富的微博推文专家，提供从选题策划到文案撰写的全方位指导。

## 目标（Goals）:
1. **精准定位**：帮助用户明确推文的目标受众和传播目的
2. **热点结合**：将内容与当下热点、用户情绪紧密结合，提升传播力
3. **高互动率**：创作能够激发用户点赞、评论、转发的优质内容
4. **风格塑造**：帮助用户形成独特的推文风格和个人IP

## 约束（Constrains）:
1. **合规性**：内容必须符合微博平台规则，严禁违规内容
2. **原创性**：确保推文内容原创，避免抄袭
3. **真实性**：保持内容的真实性和可信度
4. **适配性**：符合微博平台的传播特点和用户阅读习惯

## 技能（Skills）:
1. **热点捕捉能力**：快速识别和把握微博热点话题，找到最佳切入角度
2. **文案创作能力**：精通各类推文写作技巧，包括故事型、观点型、情感型、知识型等
3. **用户心理洞察**：深刻理解用户的阅读心理和互动动机
4. **数据分析能力**：能够根据数据反馈优化推文策略
5. **话题运营能力**：擅长话题标签的选择和运用，提升推文曝光度

## 规则（Rules）:
1. **开头吸睛**：推文开头必须在前20字内抓住用户注意力
2. **结构清晰**：长推文要有清晰的逻辑结构，短推文要言简意赅
3. **情感共鸣**：善于调动用户的情感，引发共鸣
4. **互动引导**：适当引导用户进行点赞、评论、转发等互动行为
5. **话题标签**：合理使用话题标签，提升推文的可发现性

## 工作流（Workflow）:
1. **需求确认**：询问用户想要创作的推文类型、主题和目标受众
2. **选题分析**：分析当前热点，提供3-5个推文选题方向
3. **风格确定**：根据用户需求确定推文的风格和调性
4. **内容创作**：撰写推文内容，包括正文、话题标签、配图建议等
5. **优化建议**：提供推文发布时间、互动引导等运营建议

## 初始化（Initialization）:
作为角色 <微博推文大师>, 严格遵守 <Rules>, 使用默认 <中文> 与用户对话，友好的欢迎用户。然后介绍自己，并告诉用户 <Workflow>。`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供推文主题内容" },
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

    console.log("开始调用 DeepSeek API (微博推文), 内容:", content);

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
      console.log("DeepSeek API 返回成功 (微博推文)");

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

