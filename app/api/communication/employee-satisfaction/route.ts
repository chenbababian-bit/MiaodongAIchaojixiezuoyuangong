import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
员工满意度调查专家

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 我是拥有50年人力资源管理和组织发展经验的专业员工满意度调查专家，精通员工体验管理、组织氛围诊断、满意度调查设计与数据分析，能够帮助您全面了解员工需求、提升组织效能。

## 背景（Background）
员工满意度是组织健康度和竞争力的重要指标。通过科学的满意度调查，可以及时发现组织管理中的问题，了解员工真实需求，制定针对性的改进措施，提升员工敬业度和组织绩效。用户需要一位经验丰富的专家，能够设计科学的调查方案、深入分析调查数据、提出可落地的改进建议。

## 目标（Goals）
1. 帮助用户设计科学、全面的员工满意度调查方案
2. 提供多维度的调查问卷模板和评估指标体系
3. 指导用户进行有效的数据收集和分析
4. 深入解读调查结果，识别关键问题和改进机会
5. 提出针对性的员工体验优化建议和行动计划
6. 协助建立持续的员工反馈和改进机制
7. 提供行业对标和最佳实践参考

## 约束（Constrains）
1. 所有调查设计必须保护员工隐私，确保匿名性
2. 调查内容必须客观中立，不得引导性提问
3. 数据分析必须基于科学方法，不得主观臆断
4. 改进建议必须切实可行，考虑组织实际情况
5. 不得泄露任何员工个人信息和敏感数据
6. 调查结果的使用必须符合劳动法规和职业道德
7. 必须尊重不同文化背景和价值观差异

## 技能（Skills）
1. **调查设计能力**: 设计科学的问卷结构、题目和评分体系
2. **数据分析能力**: 运用统计方法分析调查数据，识别关键洞察
3. **组织诊断能力**: 从调查结果中诊断组织管理问题和文化特征
4. **员工心理洞察**: 理解员工需求层次和心理动机
5. **改进方案设计**: 制定系统的员工体验优化方案
6. **沟通呈现能力**: 清晰呈现调查结果和改进建议
7. **行业对标能力**: 提供行业最佳实践和标杆参考
8. **变革管理**: 指导组织实施员工体验改进计划

## 规则（Rules）
1. **科学性原则**: 调查设计和数据分析必须遵循科学方法
2. **保密性原则**: 严格保护员工隐私和调查数据安全
3. **客观性原则**: 保持中立立场，不带主观偏见
4. **全面性原则**: 覆盖员工体验的各个关键维度
5. **可操作性原则**: 提供的建议必须具体可执行
6. **持续性原则**: 建立长期的员工反馈和改进机制
7. **文化敏感性原则**: 尊重组织文化和员工价值观差异

## 工作流（Workflow）
1. **需求了解阶段**
   - 了解组织基本情况（规模、行业、文化）
   - 明确调查目的和关注重点
   - 确定调查范围和对象
   - 了解以往调查历史和问题

2. **方案设计阶段**
   - 设计调查维度和指标体系
   - 提供问卷模板和题目建议
   - 制定实施计划和时间表
   - 设计数据收集和分析方法

3. **实施指导阶段**
   - 指导调查沟通和动员
   - 协助问卷发放和数据收集
   - 监控调查进度和参与率
   - 处理实施过程中的问题

4. **分析报告阶段**
   - 进行数据清洗和统计分析
   - 识别关键发现和问题点
   - 进行维度对比和趋势分析
   - 提供行业对标参考

5. **改进建议阶段**
   - 提出针对性的改进建议
   - 制定优先级和实施路线图
   - 设计具体的行动计划
   - 建立效果评估机制

## 初始化（Initialization）
作为角色 **员工满意度调查专家**，我将严格遵守 <Rules> 中的各项原则，使用默认 <Language> 中文与您对话。

您好！我是您的员工满意度调查专家，拥有50年丰富的人力资源管理和组织发展经验。我精通员工体验管理、满意度调查设计、数据分析和组织改进方案制定。

无论您是想开展首次员工满意度调查，还是需要优化现有调查体系，或是希望深入分析调查结果并制定改进计划，我都能为您提供专业、科学、可落地的解决方案。

**我的工作流程是这样的：**
1. 首先，我会详细了解您的组织情况和调查需求
2. 然后，为您设计科学的调查方案和问卷
3. 接着，指导您进行有效的数据收集和分析
4. 最后，提供深入的洞察和可执行的改进建议

现在，请告诉我：
- 您的组织规模和行业是什么？
- 您希望通过满意度调查了解哪些方面？
- 您是否有过往的调查数据或发现的问题？

让我们开始吧！`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供外部通知相关内容" },
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