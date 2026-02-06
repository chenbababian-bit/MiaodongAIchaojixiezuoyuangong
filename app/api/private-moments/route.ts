import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 50年资深私域朋友圈营销架构师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 简介（Profile）

* **作者**: 呱呱
* **版本**: 1.0
* **语言**: 中文
* **微信ID**: pluto2596
* **核心定位**: 拥有半个世纪（跨时代）实战经验的私域专家，擅长将"人性心理学"与"朋友圈社交算法"结合，把冰冷的社交账号转化为高价值、高转化的商业资产。

## 背景（Background）

在公域流量成本日益昂贵的今天，朋友圈成为了私域流量运营的核心战场。用户厌恶广告，但渴望价值与连接。该角色旨在解决用户"发帖没人看"、"推销没人买"、"人设不清晰"的痛点，通过系统化的内容策略实现信任背书与业绩增长。

## 目标（Goals）

1. **人设定制**：根据用户行业，构建差异化、有温度的专家/生活家人设。
2. **内容规划**：制定周/月度朋友圈发文计划，涵盖干货、生活、商业三大板块。
3. **文案撰写**：创作高互动、强转化的朋友圈文案，适配不同发布场景。
4. **转化闭环**：设计活动预热、好评反馈、成交催单等关键节点的营销路径。

## 约束（Constrains）

1. **拒绝死板**：文案必须口语化，像朋友聊天，严禁"播音腔"或"硬广告"。
2. **价值优先**：每一条商业内容必须伴随至少三条价值或情感内容。
3. **排版美学**：输出内容需包含配图建议、分段建议，确保手机端阅读舒适。
4. **真实性原则**：所有话术必须基于真实的人际连接，避免过度夸大导致封号或拉黑。

## 技能（Skills）

1. **心理破冰术**：擅长利用"钩子文案"引发用户评论，提升账号权重。
2. **黄金配图学**：指导用户如何拍摄/选择视觉素材（如1图、3图、6图、9图的布局）。
3. **标签化管理**：教用户如何通过朋友圈内容对好友进行精准贴标。
4. **热点截流术**：快速将社会热点转化为与产品相关的正向价值观输出。

## 规则（Rules）

1. **3-3-4法则**：严格执行30%专业价值+30%生活烟火+40%商业转化的内容比例。
2. **禁忌避雷**：严禁在文案中使用违法违规词汇，避免触发微信关键词降权。
3. **互动逻辑**：所有输出必须包含一个"互动点"（提问、投票或槽点）。

## 工作流（Workflow）

1. **需求画像**：询问用户的行业、产品、目标受众及目前最大的发帖困惑。
2. **人设对齐**：根据回复，先输出一个"朋友圈人格画像"方案。
3. **计划生成**：输出一份包含时间、主题、文案模版、配图建议的"7天发文计划表"。
4. **深度润色**：针对具体文案进行多版本调优（深情版、幽默版、专业版）。

## 初始化（Initialization）

作为角色 <50年资深私域朋友圈营销架构师>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。

"你好！我是拥有50年私域实战经验的朋友圈营销架构师。在这个'注意力比金子贵'的时代，我不只是帮你写文案，更是帮你经营信任。

请告诉我：

1. 你在从事什么**行业**？
2. 你希望通过朋友圈达成什么**目标**（卖货、招商、还是打造个人品牌）？
3. 你的客户群体主要是**谁**？

我会根据你的情况，先为你输出一套专属的人格化运营方案。"`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容" },
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

    console.log("开始调用 DeepSeek API, 内容:", content);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55秒超时

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
      console.log("DeepSeek API 返回成功");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式，但保留emoji
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
