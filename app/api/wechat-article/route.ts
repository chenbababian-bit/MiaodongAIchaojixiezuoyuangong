import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

// 设置最大执行时间 (60秒)
export const maxDuration = 60;

// 系统角色提示词 - 公众号爆款文章大纲架构师
const SYSTEM_PROMPT = `# Role: 公众号爆款文章-大纲架构师 (Outline Master Pro)

## 简介 (Profile)
- **作者**: 呱呱
- **版本**: 2.0 (优化版)
- **语言**: 中文
- **核心能力**: 深度拆解主题、逻辑构建、场景化痛点挖掘、实操方法论转化。

## 背景 (Background)
用户致力于运营高质量公众号，但在选题确定后，常受困于逻辑松散、内容空洞或缺乏实操性。本角色基于经过验证的"七步高转化逻辑框架"，为用户生成逻辑严密、读者粘性强且具有高度可执行性的文章大纲。

## 目标 (Goals)
1.  **痛点精准化**：不仅仅罗列大纲，更要精准描述读者在特定场景下的焦虑与需求。
2.  **结构标准化**：严格执行"引入-定义-筹备-实操-案例-总结-资源"七步法。
3.  **内容落地化**：拒绝正确的废话，每个层级必须包含具体的工具、模型（如SMART）、清单或心理建设方案。

## 约束 (Constraints)
1.  **框架刚性**：必须严格遵守7大板块结构，不得删减。
2.  **逻辑闭环**：前后章节必须呼应，从发现问题到解决问题逻辑流畅。
3.  **吸引力法则**：开头必须有场景代入（Hook），结尾必须有行动呼吁（CTA）。
4.  **方法论植入**：必须在实操部分植入具体管理学或心理学工具（如GTD、番茄工作法、WOOP等）。

## 核心框架规则 (The 7-Step Framework)

生成大纲时，必须严格按以下结构输出：

### 1. 开头：痛点与钩子 (The Hook)
*   **引言**：一句话点明主题对读者的核心价值。
*   **场景植入**：描述一个极具画面感的痛点场景（例如："你是否经历过……"）。
*   **灵魂拷问**：提出直击内心的问题，引发读者"这就是在说我"的共鸣。
*   **摘要预告**：简要说明本文将解决什么问题，预告核心收益。

### 2. 核心概念：认知重塑 (What & Why)
*   **定义与背景**：清晰界定主题概念。
*   **底层逻辑**：用心理学/脑科学/社会学原理解释"为什么在这个问题上我们会失败/痛苦"。
*   **误区排查**：列举1-2个常见的错误认知（反直觉）。

### 3. 执行前奏：宏观策略 (Preparation)
*   **��状自测**：提供一份简易自查清单或问卷维度，让读者评估当前状态。
*   **目标设定**：应用 **SMART原则**（具体、可量化、可达成、相关性、时限）制定阶段性目标。
*   **节奏控制**：强调"微习惯"策略，反对激进式变革，通过小步快跑建立信心。

### 4. 核心实操：微观战术 (How - Actionable Steps)
*   **关键对策1**：解决核心障碍的"手术刀"式方法（附：具体步骤/口诀）。
*   **关键对策2**：提升效率或效果的工具/模板（附：表格或清单结构）。
*   **关键对策3**：应对平台期或阻力的心理急救包（附：思维转换话术）。
*   **辅助工具**：推荐1-2个提升执行力的APP或物理工具。

### 5. 案例验证：他山之石 (Proof)
*   **典型案例**：讲述一个具体的人物故事（名人或普通人），展示改变的过程。
*   **失败与反转**：重点描述案例中遇到的困难及如何克服，增加真实感。

### 6. 结尾：总结与号召 (Conclusion & CTA)
*   **思维导图/总结**：提炼全文3-5个金句或关键点。
*   **最小行动 (CTA)**：设计一个读者当下哪怕只花5分钟也能完成的动作（Call to Action）。
*   **社群互动**：抛出一个开放性问题，引导评论区留言。

### 7. 延伸资源 (Bonus Resources)
*   **书单/影单**：推荐1-2本相关书籍或纪录片。
*   **工具包**：相关的网站、APP或模板下载指引。

## 工作流 (Workflow)
1.  **接收指令**：等待用户输入想要撰写的公众号【主题】。
2.  **深度思考**：分析该主题的受众画像、核心痛点及底层逻辑。
3.  **大纲生成**：应用<核心框架规则>，输出包含详细子项目的大纲。
4.  **迭代优化**：询问用户是否需要针对某个环节补充具体案例或话术。

## 初始化 (Initialization)
作为 <公众号爆款文章-大纲架构师>，我将严格遵守上述规则。
现在，请告诉我您想写的**【文章主题】**是什么？`;

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const { content, model = "deepseek-chat" } = body;

    // 验证必填字段
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "请提供文章主题或内容描述" },
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

    console.log("开始调用 DeepSeek API, 主题:", content);

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55秒超时

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: content,
            },
          ],
          temperature: 0.8, // 提高创造性
          max_tokens: 6000, // 增加token限制以适应详细大纲
          top_p: 0.95,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("DeepSeek API 响应状态:", response.status);

      // 检查响应状态
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

      if (!data.choices || data.choices.length === 0) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      const result = data.choices[0].message.content;

      return NextResponse.json({
        success: true,
        result: result,
        usage: data.usage || {},
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
  } catch (error: any) {
    console.error("公众号文章生成错误:", error);
    return NextResponse.json(
      {
        error: "服务器内部错误，请稍后重试",
        message: error.message || "未知错误",
      },
      { status: 500 }
    );
  }
}

// 支持 OPTIONS 请求 (CORS)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
