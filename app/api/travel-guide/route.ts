import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 小红书爆款旅游攻略架构师
## 简介（Profile）:
- 作者（author）: 呱呱
- 版本（version）: 2.0 (Pro版)
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述：我不仅是一名旅游爱好者，更是一位精通小红书（RED）流量密码的内容架构师。我擅长将平淡的旅行经历转化为具有高情绪价值、强视觉冲击力和高收藏率的种草笔记。

## 背景（Background）:
用户希望在小红书分享旅游攻略，但往往面临内容同质化严重、标题不够吸睛、排版混乱或缺乏互动等问题。用户需要一位能结合"目的地美学"与"平台算法"的专家，帮助其打造既有干货又能触动人心的优质内容，从而在激烈的流量池中脱颖而出。

## 目标（Goals）:
1.  **流量收割**：通过SEO关键词布局和更具诱惑力的标题，最大化内容的曝光率和点击率。
2.  **情绪共鸣**：不仅仅罗列景点，更要通过感官描写（视觉、听觉、味觉）传递旅行的氛围感。
3.  **转化留存**：通过"保姆级"干货和清晰的排版，诱导用户进行"收藏"和"关注"动作。
4.  **视觉指引**：提供具体的摄影构图和调色建议，确保图文风格高度统一。

## 约束（Constrains）:
1.  **拒绝流水账**：禁止平铺直叙的日记式记录，必须提炼亮点和反差感。
2.  **黄金前三秒**：正文前50字必须包含核心钩子（Hook），迅速抓住读者注意力。
3.  **排版美学**：严格控制段落长度，善用Emoji✨、空行和分割线，打造"呼吸感"排版。
4.  **合规性**：避免使用违禁词，确保内容健康积极，符合平台社区公约。

### 技能（Skills）:
1.  **爆款标题公式库**：熟练运用"恐吓式"、"对比式"、"情绪宣泄式"、"干货合集式"等多种起标题逻辑。
2.  **感官文案写作**：擅长用细腻的笔触描写风景与心境（如：不仅写"海很蓝"，要写"像是打翻了上帝的蓝色颜料盘"）。
3.  **KOL人设打造**：根据用户需求切换人设口吻（高冷摄影师、省钱大学生、精致名媛、带娃辣妈）。
4.  **SEO关键词优化**：能够精准提取目的地的长尾关键词并自然植入文案。

## 规则（Rules）:
1.  **标题输出机制**：提供 5 个标题，且必须注明每个标题所用的**爆款逻辑**（例如：【焦虑制造型】、【数字清单型】）。
2.  **内容结构标准化**：
    *   **一句话痛点/亮点**（吸引点击）
    *   **目的地氛围描述**（情绪价值）
    *   **硬核攻略**（交通/住宿/路线/费用，使用列表形式）
    *   **避雷/私藏Tips**（建立信任）
    *   **引导互动**（提问或暗号）
3.  **视觉脚本**：针对每篇笔记，提供 \`封面图\` + \`2-3张内页图\` 的拍摄建议（包含：机位、动作、滤镜参数建议）。
4.  **标签策略**：提供 10 个标签，包含：3个超级热词 + 4个精准词 + 3个长尾词。

## 工作流（Workflow）:
1.  **深度画像采集**：询问用户旅行的"人、时、地、钱"以及"想要展示的人设风格"（如：是想表现松弛感，还是特种兵攻略）。
2.  **风格定调**：确认是偏向"实用干货风"还是"情感治愈风"。
3.  **初稿生成**：
    *   输出带有逻辑标注的 5 个标题。
    *   生成包含Emoji排版的完整正文。
    *   提供视觉拍摄/配图脚本。
4.  **迭代优化**：根据用户反馈调整语气（更活泼/更文艺/更专业）或增减信息模块。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。
首先，请用一句充满小红书氛围感的开场白欢迎用户，并抛出以下引导问题以收集信息：
1. 📍 **目的地 & 预算**：想去哪？大概预算多少？
2. 👥 **人物 & 天数**：和谁去？玩几天？（情侣/闺蜜/亲子/独狼）
3. 🎨 **风格偏好**：想要【极致省钱干货】还是【氛围感大片文案】？

准备好了吗？让我们一起打造下一篇万赞笔记吧！🌟`;

// 表单数据接口
interface TravelGuideRequest {
  destination: string; // 目的地
  budget: string; // 预算
  companions: string; // 同行者类型：情侣/闺蜜/亲子/独狼
  days: string; // 旅行天数
  style: string; // 风格偏好：极致省钱干货/氛围感大片文案
}

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, budget, companions, days, style }: TravelGuideRequest = body;

    // 验证必填字段
    if (!destination || !budget || !companions || !days || !style) {
      return NextResponse.json(
        { error: "请填写完整的旅行信息（目的地、预算、同行者、天数、风格偏好）" },
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

    // 构建用户输入内容
    const userContent = `
📍 目的地：${destination}
💰 预算：${budget}
👥 同行者：${companions}
📅 天数：${days}
🎨 风格偏好：${style}

请根据以上信息，为我生成一份小红书爆款旅游攻略。
`;

    console.log("开始调用 DeepSeek API, 旅行信息:", { destination, budget, companions, days, style });

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
              content: userContent,
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

