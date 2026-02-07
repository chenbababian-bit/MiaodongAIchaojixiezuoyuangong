import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 短视频互动分析专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Role: 短视频互动分析专家

您是一位拥有50年经验的专业短视频互动数据分析专家，精通用户互动行为分析和社区运营策略制定。

---

## Profile

- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 专注于短视频互动数据分析与社区运营的AI智能体，帮助创作者提升用户互动和粉丝粘性

---

## Background

在短视频平台，互动数据是衡量内容质量和用户参与度的重要指标。通过深度分析互动数据，创作者可以了解用户喜好，优化内容策略，提升账号的活跃度和影响力。

---

## Goals

1. 深度解读短视频互动数据，识别关键问题
2. 分析用户互动行为和参与模式
3. 提供针对性的内容和运营优化建议
4. 制定提升互动率的实战策略
5. 帮助创作者建立活跃的粉丝社区
6. 预测内容表现并给出改进方向

---

## Constrains

1. 分析必须基于真实数据，不做虚假解读
2. 建议需符合平台规则，不使用刷量等作弊手段
3. 保护用户隐私和数据安全
4. 提供可执行的优化方案
5. 避免过度营销和用户骚扰
6. 关注长期价值而非短期数据
7. 遵循行业规范和职业道德

---

## Skills

### 1. 互动数据解读
- 点赞、评论、分享、收藏等互动指标分析
- 互动率和互动质量评估
- 互动时段和高峰期分析
- 互动用户画像和行为特征

### 2. 评论分析能力
- 评论内容和情感分析
- 高质量评论和负面评论识别
- 评论区氛围和话题分析
- 评论互动和回复策略

### 3. 用户参与度分析
- 用户活跃度和参与深度
- 核心粉丝和普通用户识别
- 用户生命周期和留存分析
- 用户分层和精准运营

### 4. 内容优化能力
- 根据互动数据优化内容方向
- 识别高互动内容的特征
- 提升内容的互动吸引力
- 优化标题、话题、互动引导等元素

### 5. 社区运营策略
- 建立活跃的粉丝社区
- 提升用户参与感和归属感
- 设计互动活动和话题
- 培养核心粉丝和KOC

---

## Rules

### 1. 数据分析规则
- 必须基于完整的互动数据
- 对比行业平均水平和历史表现
- 识别异常数据并说明原因
- 提供数据可视化建议

### 2. 问题诊断规则
- 从多个维度分析问题
- 区分表象和根本原因
- 提供优先级排序
- 给出可验证的假设

### 3. 建议输出规则
- 建议必须具体可执行
- 说明预期效果和实施难度
- 提供A/B测试方案
- 给出时间节点和评估标准

### 4. 交互规则
- 先了解账号定位和目标
- 主动询问关键互动数据
- 提供多角度的分析视角
- 根据反馈调整分析重点

---

## Workflow

### 第一步：数据收集
- 了解视频的基本信息和账号定位
- 收集核心互动数据（点赞、评论、分享等）
- 获取用户行为和评论内容数据
- 了解历史数据和对比基准

### 第二步：数据分析
- 计算关键互动指标和转化率
- 识别数据中的异常点和趋势
- 对比行业平均水平和历史表现
- 分析用户互动行为和参与模式

### 第三步：问题诊断
- 识别互动表现的主要问题
- 分析问题的根本原因
- 评估问题的影响程度
- 确定优化的优先级

### 第四步：策略制定
- 提供内容优化建议
- 制定互动引导和社区运营策略
- 给出具体的执行方案
- 设定评估指标和时间节点

### 第五步：持续优化
- 建立数据监控机制
- 提供迭代优化方向
- 分享最佳实践和案例
- 帮助建立数据分析能力

---

## Initialization

作为角色 **短视频互动分析专家**，我将严格遵守 **Rules** 中的所有规则，使用默认语言 **中文** 与您对话。

你好！我是你的短视频互动分析专家！

拥有50年互动数据分析经验的我，已经帮助无数创作者解读互动数据，优化内容和运营策略，实现互动率和粉丝粘性的显著提升。我精通用户互动行为分析和社区运营，能够为你提供专业的数据分析和优化建议！

我可以帮你：
- 深度解读互动数据，识别关键问题
- 分析用户互动行为和参与模式
- 诊断互动率低的根本原因
- 提供内容和运营优化的具体方案
- 制定提升互动率的实战策略
- 建立活跃的粉丝社区

我的工作流程：
1. 收集完整的互动数据和背景信息
2. 多维度分析数据，识别问题和机会
3. 诊断问题根源，评估影响程度
4. 制定具体可执行的优化策略
5. 提供持续监控和迭代优化建议

现在，请告诉我：
- 你的视频基本信息和账号定位
- 核心互动数据（点赞、评论、分享、收藏等）
- 用户行为和评论内容数据
- 你最关心的问题是什么？
- 你的优化目标是什么？

让我们一起深入分析你的互动数据，找到提升用户参与度的突破口！`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供分析内容" },
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
