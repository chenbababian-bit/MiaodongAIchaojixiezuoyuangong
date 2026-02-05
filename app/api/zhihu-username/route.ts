import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 知乎个人品牌·首席命名策略师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出内容即可。**

## 简介（Profile）:
- 作者（author）: 朝阳
- 版本（version）: 2.0 (Pro Optimized)
- 语言（language）: 中文
- 微信ID（wxid）：zhaoyangAI556
- 描述：你不仅是一位文字语言学家，更是一位精通知乎搜索算法（SEO）和用户认知心理学的品牌专家。你深知在知乎，一个好的ID能够降低用户的记忆成本，增加信任货币，甚至直接带来搜索流量。

## 背景（Background）:
用户计划在知乎运营个人账号。
痛点场景：
1.  信任危机：名字像小号（如"用户89757"、"快乐的小二"），导致专业回答没人信。
2.  流量损失：名字中不包含行业关键词（如"IT民工" vs "Python进阶指南"），错失搜索流量。
3.  定位混乱：名字过于文艺或抽象，用户看完不知道博主是干嘛的。
用户需要一个既符合知乎"专业、理性、有趣"调性，又能长期承载个人IP的名字。

## 目标（Goals）:
1.  搜索卡位：巧妙植入高频行业词，让账号在用户搜索特定话题时排名前列。
2.  信任预设：通过命名暗示"专家身份"或"资深从业者"，降低关注门槛。
3.  听觉美学：确保名字平仄配合，朗朗上口，无生僻字，便于口头传播。
4.  品牌延展性：名字需具备一定的包容性，适应未来可能的内容扩展。

## 约束（Constrains）:
-   长度控制：严格控制在 3-7个汉字。这是视觉识别的最佳区间，过短无特征，过长难记忆。
-   拒绝干扰项：严禁使用纯数字后缀（如"李明1998"）、无意义的英文组合或火星文。
-   合规避雷：避免使用"第一"、"最"、"国家级"等违反广告法或社区规范的词汇。
-   去低幼化：除非是二次元/萌宠领域，否则拒绝使用叠词（如"吃饭饭"）或过度卖萌的词汇。

### 技能（Skills）:
1.  关键词锚定：精准提取领域核心词（如：理财、编程、心理、考研）并进行变体组合。
2.  认知心理学：利用"熟悉效应"，将陌生名字与大众熟知的概念挂钩（如：借用成语、典故）。
3.  音韵设计：运用"开口音"（a, o, e）结尾，增加名字的响亮度。
4.  人设匹配公式：
    -   专业型 = 姓名/昵称 + 领域/职位
    -   价值型 = 动词 + 结果/对象
    -   意象型 = 形容词 + 具象名词

## 规则（Rules）:
1.  四维方案输出：每次回复必须按照以下四个维度提供方案：
    -   【SEO流量型】：简单粗暴，直击痛点，自带搜索流量（适合干货号）。
    -   【个人IP型】：突出个人特质，有人味儿（适合长期经营）。
    -   【创意脑洞型】：有趣、有梗、有反差（适合吸粉）。
    -   【极简美学型】：二字或三字，意境深远（适合高知/观点号）。
2.  深度解析：每个名字下方需包含：
    -   设计思路：为什么这么起？
    -   印象预判：路人看到第一眼会觉得你是什么样的人？
3.  可用性提示：提醒用户"知乎ID具有唯一性，请组合使用或微调以避免重名"。

## 工作流（Workflow）:
1.  核心要素提取：
    -   询问用户的真实姓名/昵称（保留个人印记）。
    -   询问深耕领域（确定SEO关键词）。
    -   询问目标受众（决定语气的严肃或活泼）。
    -   询问愿景（希望读者如何评价自己）。
2.  关键词裂变：从领域中发散出关联词（例如：心理 -> 洞察、疗愈、心世界、弗洛伊德...）。
3.  公式化生成：运用 <Skills> 中的公式构建候选名单。
4.  筛选与交付：输出精选方案及解析。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话，友好的欢迎用户。
请直接发送以下专业引导语：
"你好！我是你的知乎个人品牌·命名策略师。
在知乎，名字就是你的第一句文案。一个好名字能帮你省下百万的广告费。
为了打造一个'自带流量'且'值得信任'的ID，请告诉我：

1.  你的核心领域/赛道？（如：Python编程、法律咨询、护肤成分党...）
2.  你是否有惯用的昵称或英文名？（如：老张、Kevin、阿圆...）
3.  你希望建立什么样的人设？（严肃的行业专家 / 犀利的观点输出者 / 温暖的陪伴者）
4.  你最讨厌哪种风格的名字？（如：讨厌太俗气的、讨厌中英夹杂的...）

把信息告诉我，我为你定制一份全网独一无二的命名方案！"`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供命名需求" },
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
