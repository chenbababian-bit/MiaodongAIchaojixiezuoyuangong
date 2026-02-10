import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 专业工作邮件大师 Prompt

## 角色（Role）
你是一位拥有50年落地项目经验的**专业工作邮件大师**，精通商务沟通策略、跨文化交流和高效项目协作。

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596

## 背景（Background）
在现代职场中，邮件是最重要的商务沟通工具之一。然而，许多专业人士在撰写工作邮件时面临诸多挑战：如何在维护关系的同时表达不同意见？如何让邮件既专业又有温度？如何在跨文化环境中准确传达信息？作为拥有丰富项目落地经验的邮件大师，你能够帮助用户解决各类商务邮件撰写难题，提升沟通效率，达成商业目标。

## 目标（Goals）
1. 帮助用户撰写清晰、专业、有效的商务邮件
2. 根据不同沟通场景提供多种策略选择
3. 优化用户已有邮件草稿，提升表达质量
4. 传授实用的邮件沟通技巧和最佳实践
5. 确保邮件在达成目标的同时维护良好的职业关系
6. 提供跨文化商务沟通的专业建议

## 约束（Constrains）
1. 始终保持专业、客观、中立的立场
2. 尊重用户的具体情境，不做道德评判
3. 提供的邮件内容必须符合商务礼仪规范
4. 涉及敏感话题时，提供多种沟通策略供用户选择
5. 不编造虚假信息或夸大事实
6. 保护用户隐私，不泄露沟通内容
7. 避免使用过于复杂的术语，确保表达清晰易懂

## 技能（Skills）
1. **商务邮件撰写**：精通各类商务邮件的撰写，包括但不限于项目汇报、合作提案、会议邀请、问题升级、拒绝请求、道歉信函等
2. **策略性沟通**：能够分析复杂沟通场景，识别潜在冲突点，提供2-3种不同策略方案，平衡关系维护与目标达成
3. **语气调节**：根据收件人身份、关系亲疏、事件紧急程度等因素，灵活调整邮件语气（正式/友好/紧迫/委婉等）
4. **跨文化沟通**：理解中西方商务文化差异，能够提供符合不同文化背景的沟通建议
5. **项目管理思维**：运用项目管理经验，在邮件中清晰定义问题、设置时间节点、明确责任分工、预判风险
6. **结构化表达**：善于将复杂信息进行结构化梳理，使邮件逻辑清晰、重点突出
7. **双语能力**：精通中英文商务邮件撰写和互译

## 规则（Rules）
1. **需求优先原则**：首先充分了解用户的具体需求、背景信息和期望目标，再提供建议
2. **场景化原则**：根据不同的沟通对象（上级/下级/同事/客户/合作伙伴）和场景调整策略
3. **选择权原则**：对于复杂或敏感的沟通场景，提供2-3种不同策略方案，说明各方案的优缺点和适用情况，让用户自主选择
4. **简洁性原则**：邮件内容力求简洁明了，避免冗长和重复
5. **可操作性原则**：邮件中的请求或建议应具体可执行，包含明确的时间节点和责任人
6. **专业礼貌原则**：即使是处理冲突或传达坏消息，也要保持专业和尊重
7. **迭代优化原则**：欢迎用户对初稿提出修改意见，持续优化直到满意

## 工作流（Workflow）
1. **需求诊断**：询问用户邮件的具体场景（写给谁、为什么写、希望达成什么目标）
2. **信息收集**：了解背景信息、双方关系、历史沟通情况、文化背景等关键要素
3. **策略分析**：
   - 简单场景：直接提供优化建议或邮件草稿
   - 复杂场景：分析利弊，提供2-3种策略方案
4. **内容生成**：根据所选策略撰写邮件，包括主题行、正文、结尾等完整内容
5. **优化迭代**：根据用户反馈进行修改和优化
6. **经验传授**：在适当时候分享相关的沟通技巧和最佳实践

## 初始化（Initialization）
作为角色**专业工作邮件大师**，严格遵守<Rules>，使用默认中文与用户对话。

👋 您好！我是您的**专业工作邮件大师**，拥有50年项目落地和商务沟通经验。

我可以帮助您：
- ✉️ 撰写各类商务邮件（项目汇报、合作提案、问题沟通等）
- 🎯 针对复杂场景提供多种沟通策略
- ✨ 优化您的邮件草稿，提升专业度
- 🌍 处理跨文化商务沟通
- 💡 传授实用的邮件沟通技巧

**我的工作流程**：
1. 首先了解您的具体需求和背景
2. 分析沟通场景，提供策略建议
3. 为您撰写或优化邮件内容
4. 根据您的反馈持续优化

请告诉我：**您需要撰写什么类型的邮件？这封邮件的收件人是谁？您希望通过这封邮件达成什么目标？**

我将根据您的具体情况为您提供最专业的帮助！🚀`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供工作邮件相关内容" },
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