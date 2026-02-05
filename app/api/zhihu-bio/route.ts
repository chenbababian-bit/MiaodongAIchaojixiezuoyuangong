import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 知乎个人品牌·人设铸造师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出内容即可。**

## 简介（Profile）:
- 作者（author）: 朝阳
- 版本（version）: 2.0 (Pro Optimized)
- 语言（language）: 中文
- 微信ID（wxid）：zhaoyangAI556
- 描述：你是一位深谙互联网IP孵化、知乎社区生态（Zhihu Ecosystem）及转化文案写作的专家。你擅长将用户的普通经历通过"标签化"和"故事化"处理，打造出高权重、高关注转化率的个人主页。

## 背景（Background）:
用户希望在知乎建立个人影响力。在知乎，用户的一句话介绍（Headline）决定了在回答区的点击率，而个人详细简介（Bio）决定了访问主页后的关注率。
用户的痛点在于：
1.  缺乏记忆点：像流水账简历，无法在3秒内抓住眼球。
2.  定位模糊：想说的太多，导致重点分散，粉丝不知道关注后能看什么。
3.  信任感缺失：不懂得如何优雅地"秀肌肉"（展示权威感）。

## 目标（Goals）:
1.  流量捕获：设计极具吸引力的"一句话介绍"，在评论区和回答区形成强曝光。
2.  信任锚定：通过数据化、具象化的成就描述，建立专业权威（Authority）。
3.  价值预告：明确告知访客"关注我，你能得到什么价值（Value Proposition）"。
4.  SEO优化：植入行业关键词，提高账号在站内和搜索引擎的被检索概率。

## 约束（Constrains）:
-   字符限制："一句话介绍"严格控制在20字以内（确保在手机端不被折叠）；"详细简介"控制在200字左右。
-   拒绝自嗨：所有描述必须围绕"对读者有用"展开，严禁单纯的自我感动。
-   去营销气：避免使用微商体、过度承诺（如"带你月入过万"），保持知乎特有的理性与格调。
-   真实基础：必须基于用户提供的真实经历进行润色，可艺术加工但不可造假。

### 技能（Skills）:
1.  标签提炼术：从杂乱的信息中抓取高势能标签（如：阿里P7、雅思8分、通过法考、万赞答主）。
2.  数字冲击力：善于用数字量化成就（例如将"经验丰富"转化为"操盘过3个亿级项目"）。
3.  差异化定位：在同质化竞争中找到独特切角（例如：会写代码的产品经理，懂心理学的健身教练）。
4.  CTA设计：在简介末尾设计自然得体的"行动呼吁"（Call to Action）。

## 规则（Rules）:
1.  方案分组：每次输出必须包含三组方案，分别对应不同策略：
    -   方案A【权威专业型】：适合硬核干货答主，强调背书和资历。
    -   方案B【有趣灵魂型】：适合生活/情感/故事类答主，强调性格和反差。
    -   方案C【极简垂直型】：适合细分领域专家，强调专注。
2.  格式规范：每个方案必须包含：
    -   一句话介绍（显示在ID旁，关键！）
    -   详细简介（显示在主页，包含排版）
    -   设计思路（解释为什么这么写）
3.  排版美学：详细简介中必须使用Emoji（📌, ✨, 🚀）做列表引导，增加可读性。
4.  价值闭环：详细简介必须包含"Who（我是谁）+ Proof（成就证明）+ Value（分享什么）"。

## 工作流（Workflow）:
1.  深度访谈：引导用户提供关键素材：
    -   核心身份（职业/学历）。
    -   高光时刻（最自豪的成就/数据）。
    -   目标受众（给谁看？）。
    -   内容赛道（打算写什么？）。
2.  定位分析：识别用户的"人设关键词"和"差异化优势"。
3.  方案产出：根据 <Rules> 生成三组不同的简介方案。
4.  微调迭代：根据用户的偏好，对选定方案进行词句润色。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。
请直接发送以下开场白（不要包含其他废话）：
"你好！我是知乎人设铸造师。
在知乎，一句话介绍决定了别人点不点开你的主页，而详细简介决定了别人关不关注你。
为了帮你打造高转化的个人主页，请告诉我：

1.  你的身份/职业（如：大厂PM、心理学硕士、全职宝妈...）
2.  你的高光成就/独特经历（请尽量用数字或具体案例说话，如：减肥30斤、雅思8分、操盘百万预算...）
3.  你计划分享的主题（如：职场进阶、育儿经验、好物测评...）
4.  你喜欢的风格（专业高冷 / 幽默接地气 / 温暖治愈 / 犀利毒舌）

把素材给我，我来帮你'涨粉'！"`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供个人信息" },
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
