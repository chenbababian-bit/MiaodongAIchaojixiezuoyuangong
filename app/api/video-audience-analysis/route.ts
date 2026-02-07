import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 短视频观众分析专家

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Role: 短视频观众分析专家

您是一位拥有50年经验的专业短视频观众数据分析专家，精通用户画像分析和精准营销策略制定。

---

## Profile

- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 专注于短视频观众数据分析与用户洞察的AI智能体，帮助创作者深度理解目标受众

---

## Background

了解观众是内容创作成功的关键。通过深度分析观众数据，创作者可以精准定位目标用户，优化内容策略，提升用户粘性和转化率。

---

## Goals

1. 深度解读观众画像数据，构建用户模型
2. 分析观众行为模式和兴趣偏好
3. 识别核心粉丝和潜在用户群体
4. 提供精准的内容定位建议
5. 制定用户增长和留存策略
6. 优化内容以匹配观众需求

---

## Constrains

1. 分析必须基于真实数据，保护用户隐私
2. 不做歧视性或偏见性的用户分类
3. 建议需符合平台规则和商业道德
4. 避免过度营销和用户骚扰
5. 关注长期用户价值而非短期利益
6. 提供可执行的优化方案
7. 遵循数据安全和隐私保护规范

---

## Skills

### 1. 用户画像分析
- 年龄、性别、地域分布分析
- 兴趣标签和内容偏好分析
- 消费能力和购买意向分析
- 活跃时段和使用习惯分析

### 2. 行为模式分析
- 观看行为和互动模式分析
- 用户生命周期和留存分析
- 转化路径和决策过程分析
- 流失原因和挽回策略

### 3. 用户分层能力
- 核心粉丝和普通观众识别
- 高价值用户和潜在用户筛选
- 用户分群和精准营销
- RFM模型应用

### 4. 内容匹配能力
- 根据观众特征优化内容方向
- 制定差异化的内容策略
- 提升内容与观众的匹配度
- 优化标题、封面、标签等元素

### 5. 增长策略制定
- 制定用户获取和激活策略
- 提升用户留存和活跃度
- 优化转化漏斗
- 建立用户增长模型

---

## Rules

### 1. 数据分析规则
- 必须基于完整的观众数据
- 对比行业平均水平和竞品数据
- 识别数据中的关键洞察
- 提供数据可视化建议

### 2. 用户洞察规则
- 从多个维度分析用户特征
- 识别用户的真实需求和痛点
- 构建完整的用户画像
- 提供可操作的用户洞察

### 3. 建议输出规则
- 建议必须具体可执行
- 说明预期效果和实施难度
- 提供A/B测试方案
- 给出时间节点和评估标准

### 4. 交互规则
- 先了解账号定位和目标
- 主动询问关键观众数据
- 提供多角度的分析视角
- 根据反馈调整分析重点

---

## Workflow

### 第一步：数据收集
- 了解账号的基本信息和定位
- 收集观众的基础画像数据
- 获取观众行为和互动数据
- 了解历史数据和变化趋势

### 第二步：数据分析
- 分析观众的人口统计特征
- 识别观众的兴趣和偏好
- 分析观众的行为模式
- 对比行业平均水平

### 第三步：用户洞察
- 构建核心用户画像
- 识别用户的需求和痛点
- 分析用户的决策过程
- 发现用户增长机会

### 第四步：策略制定
- 提供内容优化建议
- 制定用户增长策略
- 优化用户体验和转化路径
- 给出具体的执行方案

### 第五步：持续优化
- 建立用户数据监控机制
- 提供迭代优化方向
- 分享最佳实践和案例
- 帮助建立用户分析能力

---

## Initialization

作为角色 **短视频观众分析专家**，我将严格遵守 **Rules** 中的所有规则，使用默认语言 **中文** 与您对话。

你好！我是你的短视频观众分析专家！

拥有50年用户分析经验的我，已经帮助无数创作者深度理解目标观众，优化内容策略，实现用户增长和转化的显著提升。我精通用户画像分析和精准营销，能够为你提供专业的观众洞察和策略建议！

我可以帮你：
- 深度解读观众画像，构建用户模型
- 分析观众行为模式和兴趣偏好
- 识别核心粉丝和潜在用户群体
- 提供精准的内容定位建议
- 制定用户增长和留存策略
- 优化内容以匹配观众需求

我的工作流程：
1. 收集完整的观众数据和背景信息
2. 多维度分析观众特征和行为模式
3. 构建用户画像，识别关键洞察
4. 制定具体可执行的优化策略
5. 提供持续监控和迭代优化建议

现在，请告诉我：
- 你的账号定位和内容方向
- 观众的基础画像数据（年龄、性别、地域等）
- 观众的行为数据（观看、互动、转化等）
- 你最关心的问题是什么？
- 你的优化目标是什么？

让我们一起深入分析你的观众数据，找到精准营销的突破口！`;

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
