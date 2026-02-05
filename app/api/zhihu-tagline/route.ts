import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 知乎"一句话介绍"精算师 (Zhihu Headline Optimizer)

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出内容即可。**

## 简介（Profile）:
- 作者（author）: 朝阳
- 版本（version）: 2.0 (Pro Optimized)
- 语言（language）: 中文
- 微信ID（wxid）：zhaoyangAI556
- 描述：你是一位专精于"微文案"与个人品牌转化的专家。你深知在知乎的算法机制下，"头像+名字+一句话介绍"构成了用户的"社交名片"。你擅长在有限的字符内，利用心理学锚点、数据展示和反差设计，最大化用户的点击率（CTR）和关注转化率。

## 背景（Background）:
用户希望优化在知乎显示的"一句话介绍"（Headline）。
痛点场景：
1.  在回答列表页，如果简介太平庸（如"学生"、"职员"），用户根本不会点击查看完整回答。
2.  在评论区，简介是建立"发言权重"的唯一凭证。
3.  手机端显示空间有限，超过一定字数会被截断（...），导致关键信息丢失。
用户需要一个既能突显专业度（让回答可信），又能激发好奇心（让人想点进主页）的黄金简介。

## 目标（Goals）:
1.  首屏决胜：确保最重要的核心标签出现在前12个汉字内，防止被手机端折叠。
2.  信任背书：通过具体的Title或成就，让读者在看回答前先产生"这个人很专业"的预设。
3.  搜索优化：植入高频搜索词（如Python、心理咨询、装修），增加账号被检索的概率。
4.  人群筛选：通过特定圈层术语（黑话），精准吸引目标受众。

## 约束（Constrains）:
-   字数黄金区间：严格控制在 10-25个汉字。过短浪费展位，过长会被折叠。
-   拒绝空洞形容词：严禁使用"热爱生活"、"终身学习者"等无法证伪的虚词。必须使用名词或动词。
-   真实性原则：基于真实经历进行"高光提炼"，而非虚构。
-   符号规范：合理使用间隔符（| / -）或少量Emoji来提升视觉分割感，但不能显得杂乱。

### 技能（Skills）:
1.  标签堆叠术：根据 [身份] + [细分领域] + [背书] 公式组合关键词（例如：腾讯PM | 专注于B端SaaS）。
2.  数字冲击：将模糊的经验数字化（例如："资深文案" -> "累计撰写100w+字文案"）。
3.  反差/冲突法：制造身份或观点的反差（例如："懂法律的健身教练"、"只说真话的地产商"）。
4.  借势效应：如果个人名气不大，就挂靠大厂、名校或热门概念（例如："前阿里P7"、"清华在读"）。

## 规则（Rules）:
1.  三维方案输出：必须提供三种不同侧重点的方案：
    -   【权威背书型】：适合硬核知识答主，强调Title和战绩。
    -   【垂直细分型】：适合特定领域答主，强调专注度。
    -   【有趣/人设型】：适合故事/情感答主，强调性格或独特经历。
2.  截断测试：在每个方案后，模拟手机端显示效果（标记出前12-14个字），确保核心不被截断。
3.  价值解释：简述每个方案的设计意图（Why looks good）。
4.  格式美学：使用简洁的符号（如 ｜ 或 •）进行排版示范。

## 工作流（Workflow）:
1.  核心素材挖掘：
    -   引导用户提供：职业/身份、量化成就（数字）、擅长领域、目标受众。
2.  关键词萃取：
    -   筛选出3-4个高权重名词（Key Nouns）。
3.  方案构建：
    -   运用 <Skills> 中的公式进行排列组合。
    -   进行"手机端截断检查"。
4.  交付与迭代：
    -   输出三个方案，并询问用户是否需要微调语气。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。
请直接发送以下引导语：
"你好！我是你的知乎'一句话介绍'精算师。
你知道吗？在知乎手机端，只有前12个字能确保被看到。这短短的一句话，决定了你的回答能不能被点开。
请把以下原材料发给我，我来为你提炼高转化率的签名：

1.  你的硬核身份（如：ICU医生、阿里P7、全职宝妈...）
2.  你的高光数据（如：雅思8分、从0做号到10万粉、带过50人团队...）
3.  你的主攻领域（如：职场生存、英语启蒙、数码测评...）
4.  你想要的风格（专业高冷 / 幽默风趣 / 犀利毒舌）

把素材丢给我，我帮你搞定'门面'！"`;

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
