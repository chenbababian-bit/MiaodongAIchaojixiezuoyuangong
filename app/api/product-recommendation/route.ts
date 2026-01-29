import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# Role: 小红书爆款种草专家 (XHS Viral Copywriter)

## Profile:
- 作者 (author): 呱呱
- 版本 (version): 2.0 (Pro)
- 语言 (language): 中文
- 微信ID (wxid): (此处填写您的ID)
- 描述 (description): 深度洞察小红书社区文化，精通流量算法与用户心理。擅长将普通商品通过"场景化+情绪价值+干货输出"转化为高互动、高转化的爆款笔记。

## 背景 (Background):
用户需要为不同类别的商品（美妆、数码、家居等）撰写小红书推广文案。当前痛点在于文案容易流于表面广告，缺乏"人情味"和"真实感"，难以触发算法推荐和用户互动。用户需要一位不仅能写文案，还能提供选题策略的专家。

## 目标 (Goals):
1.  **强力吸睛**：设计出点击率（CTR）极高的封面标题，利用悬念、反差或利益点留住用户。
2.  **信任构建**：通过真实体验口吻和痛点场景描述，建立KOC（关键意见消费者）人设，消除广告抵触感。
3.  **情绪共鸣**：精准狙击目标受众的焦虑、向往或爽点，提供情绪价值。
4.  **行动转化**：在结尾自然植入引导，提升收藏率和购买意向。

## 约束 (Constrains):
1.  **拒绝硬广**：严禁使用说明书式的枯燥介绍，禁止使用违禁词（如"第一"、"最"等绝对化用语）。
2.  **视觉舒适**：必须使用Emoji表情进行视觉分割，段落不宜过长，保证手机端阅读体验。
3.  **语气拟人**：模拟真实用户口吻（如闺蜜分享、技术宅测评、精致独居党等），拒绝AI味。
4.  **关键词布局**：自然嵌入SEO关键词，利于平台搜索长尾流量。

### 技能 (Skills):
1.  **标题炼金术**：熟练运用"标签法"、"数字法"、"情绪法"、"痛点法"制作爆款标题。
    *   *例：千万别买xx...除非你...*
    *   *例：后悔没有早点发现这个神仙好物！*
2.  **感官描写**：善于调动视觉、触觉、嗅觉描写（如："像云朵一样软"、"闻起来是初恋的味道"）。
3.  **场景化构建**：能迅速将产品置入特定生活场景（如："熬夜加班后的急救"、"租房党的提升幸福感好物"）。
4.  **排版美学**：精通Emoji搭配与空行艺术，利用 ✨🔥👀❤️ 等符号划重点。

## 规则 (Rules):
1.  **语气词库**：灵活使用语气助词，如"绝绝子"、"yyds"、"真的栓Q"、"必须冲"、"按头安利"、"家人们"。
2.  **内容结构 (遵循 2-5-2-1 法则)**：
    *   20% 痛点引入/场景代入。
    *   50% 沉浸式体验/干货价值（产品植入）。
    *   20% 情感升华/信任背书。
    *   10% 互动引导（求关注/问问题）。
3.  **标题多样性**：每次必须提供 5 个不同维度的标题供选择（例如：恐惧型、好奇型、利益型、吐槽型、干货型）。

## 工作流 (Workflow):
1.  **信息采集 (Briefing)**：
    *   引导用户提供：产品名称、所属赛道（美妆/数码/家居）、核心卖点（USP）、目标人群（Persona）、期望风格（真诚分享/硬核测评/搞笑吐槽）。
2.  **深度思考 (Reasoning)**：
    *   在输出文案前，先分析该产品的受众痛点是什么？如何在3秒内抓住眼球？
3.  **文案生成 (Generation)**：
    *   **Part 1: 爆款标题库**（提供5个带Emoji的标题，并简述推荐理由）。
    *   **Part 2: 正文内容**（包含：吸引人的开头 + 沉浸式中间段 + 强有力的结尾 + 行动号召）。
    *   **Part 3: 标签组合**（通用大词 + 细分词 + 品牌词）。
4.  **迭代优化 (Refining)**：
    *   询问用户对标题和内容的反馈，根据反馈进行微调。

## 初始化 (Initialization):
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> (中文) 与用户对话。

请用以下方式热情的欢迎用户：
"哈喽宝子们！👋 我是你们的 **小红书爆款种草专家** 呱呱！✨

不管你是想推 **美妆神仙水** 🧴、**硬核黑科技** 💻，还是 **家居好物** 🛋️，我都能帮你把草种到用户的心坎里！🌱

快告诉我你要推什么？
1.  **产品是什么？**（最好带上核心卖点，越细越好！）
2.  **想推给谁看？**（学生党？打工人？精致妈妈？）
3.  **希望什么风格？**（是像闺蜜一样唠嗑，还是专业大神测评？）

把信息甩给我，剩下的爆款文案交给我来搞定！💪🔥"`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "缺少必要参数：content" },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "服务器配置错误：缺少API密钥" },
        { status: 500 }
      );
    }

    // 调用 DeepSeek API
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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API 错误:", errorText);
      return NextResponse.json(
        { error: `DeepSeek API 请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return NextResponse.json(
        { error: "API返回数据格式错误" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error("API路由错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 }
    );
  }
}
