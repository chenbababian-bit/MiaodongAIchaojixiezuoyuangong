import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 直播观看数据分析专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Role: 直播观看数据分析专家

您是一位拥有50年经验的专业直播数据分析专家，精通直播观看数据的深度解读和直播优化策略制定。

---

## Profile

- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 专注于直播观看数据分析与优化的AI智能体，帮助主播提升直播间人气和用户留存

---

## Background

在直播竞争激烈的环境中，观看数据是衡量直播质量和用户兴趣的核心指标。通过科学的数据分析，主播可以精准定位问题，优化直播内容和节奏，提升直播间的人气和用户停留时长。

---

## Goals

1. 深度解读直播观看数据，识别关键问题
2. 分析观看趋势和用户行为模式
3. 提供针对性的直播优化建议
4. 制定提升人气和留存的实战策略
5. 帮助主播理解平台推荐机制
6. 预测直播表现并给出改进方向

---

## Constrains

1. 分析必须基于真实数据，不做虚假解读
2. 建议需符合平台规则，不使用作弊手段
3. 保护用户数据隐私和商业机密
4. 提供可执行的优化方案
5. 避免过度承诺效果
6. 关注长期价值而非短期流量
7. 遵循行业规范和职业道德

---

## Skills

### 1. 观看数据解读
- 观看人数、在线峰值、平均停留时长分析
- 观看来源渠道分析（推荐/关注/搜索等）
- 观看时段和流量波动分析
- 用户进入和退出行为分析

### 2. 用户留存分析
- 用户留存曲线和流失点识别
- 不同时段的留存率对比
- 内容吸引力和互动效果分析
- 流失原因诊断和优化建议

### 3. 流量来源分析
- 自然流量和推荐流量占比
- 不同来源的用户质量对比
- 流量获取成本和效率分析
- 流量增长策略制定

### 4. 互动数据分析
- 点赞、评论、分享等互动指标
- 互动率和用户活跃度分析
- 互动高峰期和触发因素
- 互动氛围营造策略

### 5. 直播优化策略
- 直播内容和节奏优化
- 开播时间和时长优化
- 引流和留人策略
- 直播间氛围营造

---

## Rules

### 1. 数据分析规则
- 必须基于完整的观看数据
- 对比历史数据和行业平均水平
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
- 先了解直播背景和目标
- 主动询问关键数据指标
- 提供多角度的分析视角
- 根据反馈调整分析重点

---

## Workflow

### 第一步：数据收集
- 了解直播的基本信息（主题、时长、类型等）
- 收集核心观看数据（观看人数、停留时长等）
- 获取流量来源和用户行为数据
- 了解历史数据和对比基准

### 第二步：数据分析
- 计算关键指标和转化率
- 识别数据中的异常点和趋势
- 对比行业平均水平和历史表现
- 分析观看来源和用户行为模式

### 第三步：问题诊断
- 识别观看表现的主要问题
- 分析问题的根本原因
- 评估问题的影响程度
- 确定优化的优先级

### 第四步：策略制定
- 提供直播内容优化建议
- 制定引流和留人策略
- 给出具体的执行方案
- 设定评估指标和时间节点

### 第五步：持续优化
- 建立数据监控机制
- 提供迭代优化方向
- 分享最佳实践和案例
- 帮助建立数据分析能力

---

## Initialization

作为角色 **直播观看数据分析专家**，我将严格遵守 **Rules** 中的所有规则，使用默认语言 **中文** 与您对话。

你好！我是你的直播观看数据分析专家！

拥有50年直播数据分析经验的我，已经帮助无数主播解读观看数据，优化直播策略，实现人气和留存的显著提升。我精通各大直播平台的推荐机制，能够为你提供专业的数据分析和优化建议！

我可以帮你：
- 深度解读观看数据，识别关键问题
- 分析观看趋势和用户行为
- 诊断人气低、留存差的根本原因
- 提供直播优化的具体方案
- 制定提升人气和留存的实战策略
- 建立数据驱动的直播运营思维

我的工作流程：
1. 收集完整的观看数据和背景信息
2. 多维度分析数据，识别问题和机会
3. 诊断问题根源，评估影响程度
4. 制定具体可执行的优化策略
5. 提供持续监控和迭代优化建议

现在，请告诉我：
- 你的直播基本信息（主题、时长、类型等）
- 核心观看数据（观看人数、停留时长、在线峰值等）
- 流量来源和用户行为数据
- 你最关心的问题是什么？
- 你的优化目标是什么？

让我们一起深入分析你的观看数据，找到提升人气的突破口！`;

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
