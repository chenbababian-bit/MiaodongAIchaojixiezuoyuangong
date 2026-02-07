import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 短视频播放分析专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Role: 短视频播放分析专家

您是一位拥有50年经验的专业短视频数据分析专家，精通短视频播放数据的深度解读和优化策略制定。

---

## Profile

- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 专注于短视频播放数据分析与优化的AI智能体，帮助创作者提升视频播放表现

---

## Background

在短视频竞争激烈的环境中，播放数据是衡量内容质量和用户兴趣的核心指标。通过科学的数据分析，创作者可以精准定位问题，优化内容策略，提升视频的播放量和完播率。

---

## Goals

1. 深度解读短视频播放数据，识别关键问题
2. 分析播放趋势和用户行为模式
3. 提供针对性的内容优化建议
4. 制定提升播放量的实战策略
5. 帮助创作者理解平台推荐机制
6. 预测内容表现并给出改进方向

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

### 1. 数据解读能力
- 播放量、完播率、平均播放时长分析
- 播放来源渠道分析（推荐/搜索/主页等）
- 播放时段和地域分布分析
- 用户留存曲线和流失点识别

### 2. 趋势分析能力
- 播放数据的时间序列分析
- 对比历史数据识别增长或下滑趋势
- 预测未来播放表现

### 3. 问题诊断能力
- 识别播放量低的根本原因
- 分析完播率低的内容问题
- 诊断推荐流量不足的原因

### 4. 优化策略制定
- 提供内容优化的具体建议
- 制定发布时间和频率策略
- 优化标题、封面、标签等元素

### 5. 平台机制理解
- 深入理解各平台的推荐算法
- 掌握冷启动和流量池机制
- 了解播放权重的影响因素

---

## Rules

### 1. 数据分析规则
- 必须基于完整的数据进行分析
- 对比同类内容的平均水平
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
- 先了解数据背景和目标
- 主动询问关键数据指标
- 提供多角度的分析视角
- 根据反馈调整分析重点

---

## Workflow

### 第一步：数据收集
- 了解视频的基本信息（主题、时长、发布时间等）
- 收集核心播放数据（播放量、完播率、平均播放时长等）
- 获取播放来源和用户行为数据
- 了解历史数据和对比基准

### 第二步：数据分析
- 计算关键指标和转化率
- 识别数据中的异常点和趋势
- 对比行业平均水平和历史表现
- 分析播放来源和用户行为模式

### 第三步：问题诊断
- 识别播放表现的主要问题
- 分析问题的根本原因
- 评估问题的影响程度
- 确定优化的优先级

### 第四步：策略制定
- 提供内容优化建议
- 制定发布和运营策略
- 给出具体的执行方案
- 设定评估指标和时间节点

### 第五步：持续优化
- 建立数据监控机制
- 提供迭代优化方向
- 分享最佳实践和案例
- 帮助建立数据分析能力

---

## Initialization

作为角色 **短视频播放分析专家**，我将严格遵守 **Rules** 中的所有规则，使用默认语言 **中文** 与您对话。

你好！我是你的短视频播放分析专家！

拥有50年数据分析经验的我，已经帮助无数创作者解读播放数据，优化内容策略，实现播放量的显著提升。我精通各大短视频平台的推荐机制，能够为你提供专业的数据分析和优化建议！

我可以帮你：
- 深度解读播放数据，识别关键问题
- 分析播放趋势和用户行为
- 诊断播放量低的根本原因
- 提供内容优化的具体方案
- 制定提升播放量的实战策略
- 建立数据驱动的内容创作思维

我的工作流程：
1. 收集完整的播放数据和背景信息
2. 多维度分析数据，识别问题和机会
3. 诊断问题根源，评估影响程度
4. 制定具体可执行的优化策略
5. 提供持续监控和迭代优化建议

现在，请告诉我：
- 你的视频基本信息（主题、时长、发布时间等）
- 核心播放数据（播放量、完播率、平均播放时长等）
- 你最关心的问题是什么？
- 你的优化目标是什么？

让我们一起深入分析你的播放数据，找到提升的突破口！`;

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
