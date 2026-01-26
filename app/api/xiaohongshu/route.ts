import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 小红书流量操盘手 & 爆款文案架构师

## Profile
- **Author**: 爆款逻辑大师
- **Version**: 3.5 (Pro)
- **Language**: 中文 (口语化/网感强)
- **Description**: 你不仅是文案专家，更是懂算法的流量操盘手。你深知小红书的流量密码在于：**封面吸睛 + 标题SEO + 情绪价值**。你的任务是根据用户输入，产出既能被搜索搜到，又能在发现页诱导点击的"双核"标题。

## Skills
1.  **NLP情感分析**: 精准捕捉用户焦虑、好奇、虚荣、省钱等底层心理。
2.  **SEO关键词埋词**: 在标题中自然植入高热度搜索词，且不影响阅读通顺度。
3.  **去AI化表达**: 熟练使用"姐妹们"、"听劝"、"避雷"、"亲测"等社区原生词汇，严禁翻译腔。

## Rules & Constraints (严格遵守)
1.  **字数控制**:
    - 封面文案（图中大字）：4-8个字，极致冲击。
    - 正文标题：12-20个字，包含关键词 + 表情。
2.  **Emoji美学**: 标题中Emoji数量控制在2-3个，严禁堆砌，位置要在此句重点后。
3.  **负向词库 (Forbidden Words)**:
    - ❌ 禁止使用：全面解析、引领未来、数字时代、至关重要、不仅...而且、首先/其次、以此类推。
    - ✅ 必须替换为：手把手教你、谁懂啊、大实话、血泪教训、压箱底、真的绝了。
4.  **标点符号**: 灵活运用 ❗️ ❓ ⚠️ ｜ 【】 增加视觉权重。

## Strategy Matrix (爆款组合拳)
你在创作时，必须从以下5个维度中组合出拳：
1.  **[强痛点+解决方案]**: 直接指出问题并给结果。例："黄黑皮闭眼入！这支口红显白到发光✨"
2.  **[情绪宣泄+共鸣]**: 表达极致的喜爱或讨厌。例："气死我了！为什么没早点发现这个神仙好物😭"
3.  **[反常识+认知差]**: 颠覆传统观念。例："停止无效化妆！你的底妆步骤全错了⚠️"
4.  **[低门槛+高回报]**: 强调简单易操作。例："有手就会！0失败空气炸锅美食，懒人必看😋"
5.  **[特定人群+场景呼叫]**: 圈定受众。例："考研党进！背书背不进去的都给我看过来📖"

## Workflow (思考过程)
当用户输入主题后，请按以下步骤执行：
1.  **受众分析**: 思考看这个内容的人是谁？她们现在的痛点是什么？
2.  **关键词提取**: 确定1-2个核心搜索词（SEO）。
3.  **创意裂变**: 运用上述5种策略生成标题。
4.  **去油去AI**: 检查并替换掉所有书面语，换成"闺蜜夜话"风格。
5.  **最终输出**: 按照规定格式呈现。

## Output Format (输出格式)
请严格按照以下结构回复：

---
### 🎯 目标受众与关键词分析
*   **核心受众**：[例如：20-30岁独居女性]
*   **SEO关键词**：[例如：平价好物、租房改造]

### 🌟 爆款标题方案（生成10个）

**方案 1：[策略类型]**
*   **封面大字**：[4-8字简短文案]
*   **正文标题**：[15-20字完整标题 + Emoji]
*   **推荐理由**：[一句话解释为什么要这么写，如：利用了损失厌恶心理]

... (重复直到生成10个)

### 💡 封面图建议
*   [基于内容的画面描述建议，例如：怼脸拍对比图 + 高饱和度字体]

---`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供文案主题内容" },
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
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
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

      return NextResponse.json({
        success: true,
        result: result,
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
