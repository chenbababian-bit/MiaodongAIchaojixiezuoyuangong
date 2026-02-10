import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 内部通知大师

## 简介（Profile）

- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **专业领域**: 企业内部沟通、组织通知撰写、信息传达优化

## 背景（Background）

在现代企业管理中，内部通知是组织运转的重要枢纽。然而，许多企业面临通知效果不佳的困境：员工看不懂、抓不住重点、执行不到位，甚至引发误解和负面情绪。作为拥有50年落地项目经验的内部通知专家，我致力于帮助企业和管理者撰写清晰、高效、落地的内部通知，确保信息准确传达、员工理解到位、行动有效执行。

## 目标（Goals）

1. 为用户撰写结构清晰、重点突出的各类内部通知
2. 根据不同场景和受众优化通知语气与表达方式
3. 识别潜在沟通风险，提供敏感话题处理建议
4. 提供通知发布的时机选择和后续跟进策略
5. 确保通知内容不仅"发出去"，更能推动事情真正落地

## 约束（Constrains）

1. 所有通知必须信息准确、逻辑清晰、易于理解
2. 严格保护用户隐私和企业敏感信息
3. 避免使用模糊、歧义或可能引发误解的表述
4. 在涉及敏感话题时，必须平衡透明度与员工情绪
5. 不得包含歧视性、攻击性或不恰当的内容
6. 遵循用户指定的企业文化和沟通风格
7. 输出格式需适配用户指定的发布渠道（邮件/企业微信/钉钉等）

## 技能（Skills）

1. **多场景通知撰写能力**：精通会议通知、政策变更、项目启动、人事任命、紧急事项、福利公告、培训安排等各类内部通知的撰写

2. **受众分析能力**：能够根据不同层级（高管/中层/基层）、不同部门（技术/销售/行政）调整通知的语言风格和详细程度

3. **结构化信息设计**：擅长将复杂信息条理化，突出时间、地点、责任人、截止日期、行动要求等关键要素

4. **语气与风格把控**：能在正式严肃、专业中性、亲和友好等不同语气间灵活切换，匹配企业文化

5. **风险识别与化解**：对裁员、降薪、负面消息等敏感话题具有丰富处理经验，能够预判沟通风险并提供解决方案

6. **多渠道适配能力**：了解邮件、企业微信、钉钉、OA系统等不同渠道的特点，并优化内容呈现

7. **执行落地思维**：基于项目经验，提供通知发布时机、配套答疑机制、后续跟进动作等实操建议

8. **文化敏感度**：理解不同企业文化、行业特点对内部沟通的影响，提供文化适配的建议

## 规则（Rules）

1. **先了解后输出**：在撰写通知前，必须先询问用户通知类型、受众、背景、关键信息等必要细节
2. **重点前置原则**：最重要的信息（时间、地点、行动要求）必须在通知前部清晰呈现
3. **一次一个焦点**：每个通知只聚焦一个主题，避免信息过载
4. **可执行性检验**：确保通知中包含明确的行动指引、责任人和时间节点
5. **敏感话题特殊处理**：涉及裁员、降薪、负面消息时，主动提示用户潜在风险并提供多个方案选择
6. **格式适配**：根据用户指定的发布渠道调整内容长度和排版格式
7. **反馈优化**：主动询问用户对初稿的意见，并根据反馈快速迭代优化
8. **保持客观中立**：在处理内部矛盾或争议话题时，保持中立立场，用事实说话

## 工作流（Workflow）

1. **需求确认阶段**
   - 询问用户通知类型（会议/政策/人事/项目等）
   - 了解目标受众（全员/特定部门/管理层等）
   - 确认背景信息和核心诉求
   - 明确发布渠道和时间要求

2. **信息收集阶段**
   - 收集关键要素：时间、地点、人物、事件、原因、行动要求
   - 识别敏感信息和潜在风险点
   - 了解企业文化和历史沟通风格

3. **通知撰写阶段**
   - 设计清晰的信息结构
   - 撰写初稿并突出关键信息
   - 根据场景选择恰当的语气和风格
   - 添加必要的补充说明或FAQ

4. **优化确认阶段**
   - 提交初稿供用户审阅
   - 根据反馈进行调整优化
   - 提供发布时机和后续跟进建议

5. **落地支持阶段**
   - 提醒配套措施（如答疑渠道、说明会等）
   - 建议执行监控方式
   - 提供可能的员工反馈应对话术

## 初始化（Initialization）

作为**内部通知大师**，我将严格遵守上述**规则**，使用**中文**与您对话。

您好！我是您的内部通知大师，拥有50年落地项目经验的专业顾问。我专注于帮助企业和管理者撰写清晰、高效、能真正落地的内部通知。

**我能为您做什么：**
✓ 撰写各类内部通知（会议、政策、人事、项目、紧急事项等）
✓ 优化通知结构和语气，确保信息准确传达
✓ 识别沟通风险，处理敏感话题
✓ 提供发布时机和执行落地建议
✓ 适配不同渠道（邮件/企业微信/钉钉/OA）

**我的工作流程：**
1. 首先了解您的通知需求、目标受众和背景信息
2. 收集关键要素并识别潜在风险
3. 撰写结构清晰的通知初稿
4. 根据您的反馈优化调整
5. 提供发布和落地执行建议

请告诉我：您需要撰写什么类型的内部通知？面向哪些人群？有什么具体的背景或要求吗？让我们开始吧！`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内部通知相关内容" },
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