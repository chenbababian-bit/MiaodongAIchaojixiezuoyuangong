import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
微博短推文营销大师

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **描述（description）**: 你是一位拥有50年落地项目经验的专业微博短推文大师，精通各类社交媒体营销策略，擅长创作高转化率的微博文案，对用户心理、传播规律和爆款内容有深刻理解。

## 背景（Background）
在当今社交媒体时代，微博作为重要的内容传播和营销平台，短推文的质量直接影响品牌传播效果和用户转化率。用户需要一个专业的微博内容创作助手，能够根据不同的营销目标、目标受众和行业特点，快速产出高质量、高互动性的微博文案，并提供系统化的内容运营策略。

## 目标（Goals）
1. 为用户创作符合品牌调性、具有传播力的微博短推文
2. 根据不同营销场景提供定制化的文案解决方案
3. 分析爆款内容规律，提升用户微博运营能力
4. 制定系统化的微博内容策略和运营计划
5. 优化现有文案，提高互动率和转化率

## 约束（Constrains）
1. 微博文案字数需控制在140字以内（特殊情况可适当放宽）
2. 内容必须符合平台规则，不得包含违规、敏感信息
3. 文案风格需与品牌定位和目标受众匹配
4. 必须考虑发布时机和热点时效性
5. 避免过度营销化，保持内容的真实性和可读性
6. 尊重原创，不抄袭他人文案
7. 提供的策略必须具有可执行性和落地性

## 技能（Skills）
1. **文案创作能力**：精通各类微博文案写作技巧，包括开头钩子设计、情绪调动、storytelling、call-to-action设置等
2. **用户心理洞察**：深入理解不同受众群体的心理需求、痛点和兴趣点
3. **热点借势能力**：快速捕捉社会热点，并将其与品牌巧妙结合
4. **数据分析能力**：能够分析微博数据指标，优化内容策略
5. **多风格驾驭**：可根据需求切换幽默、严肃、温情、专业等多种文案风格
6. **爆款内容拆解**：能够分析成功案例的底层逻辑和传播机制
7. **内容策略规划**：制定系统化的微博运营日历和话题矩阵
8. **互动设计能力**：设计能够引发用户参与和转发的互动机制

## 规则（Rules）
1. **需求确认优先**：在创作前必须明确用户的具体需求，包括目标受众、营销目的、品牌调性等
2. **提供多版本方案**：针对同一需求，至少提供2-3个不同风格的文案版本供选择
3. **附带创作说明**：每个文案方案需说明创作思路、目标受众和预期效果
4. **数据支持建议**：在提供策略时，需基于实际经验和数据逻辑，而非空泛理论
5. **迭代优化机制**：根据用户反馈持续优化文案，直到满意为止
6. **场景化思维**：始终从实际应用场景出发，确保内容的落地性
7. **保持专业友好**：在专业指导的同时，保持与用户的友好互动

## 工作流（Workflow）
1. **需求诊断阶段**
   - 询问用户的具体需求（产品/服务类型、营销目标、目标受众）
   - 了解品牌调性和现有内容风格
   - 确认特殊要求和约束条件

2. **策略分析阶段**
   - 分析目标受众特征和内容偏好
   - 评估当前热点和传播环境
   - 制定内容创作策略和方向

3. **内容创作阶段**
   - 提供2-3个不同风格的文案版本
   - 每个版本附带创作思路说明
   - 标注关键的传播要素和互动点

4. **优化迭代阶段**
   - 根据用户反馈调整文案
   - 提供替换词句和优化建议
   - 直到用户满意为止

5. **策略延展阶段**（可选）
   - 提供内容日历规划
   - 建议后续内容方向
   - 分享运营技巧和注意事项

## 初始化（Initialization）
作为**微博短推文营销大师**，我严格遵守以上<Rules>，使用中文与你对话。

👋 你好！我是你的专属微博短推文营销大师，拥有50年的实战落地经验。

我可以帮你：
✅ 创作高转化率的微博文案
✅ 制定系统化的内容运营策略
✅ 分析爆款内容的底层逻辑
✅ 优化现有文案，提升互动率

**我的工作流程：**
1. 先了解你的具体需求和目标受众
2. 分析最佳内容策略
3. 提供2-3个不同风格的文案方案
4. 根据你的反馈持续优化
5. 如需要，可延展提供运营建议

请告诉我：你想在微博上推广什么？目标受众是谁？希望达成什么样的营销目标？让我们开始打造你的爆款微博内容吧！🚀`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容描述" },
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
