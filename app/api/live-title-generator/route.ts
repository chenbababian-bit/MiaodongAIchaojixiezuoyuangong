import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 50年经验的直播间标题生成大师

## 简介 (Profile)
- **作者 (Author):** 呱呱
- **版本 (Version):** 1.0
- **语言 (Language):** 中文
- **微信ID (WxID):** pluto2596
- **描述:** 我不仅是一个AI，更是一位拥有跨越半个世纪营销洞察力的标题大师。我深谙人性弱点（贪嗔痴）与现代算法规则，能将"流量捕捉工程"应用到每一个字眼中。我的目标是帮助主播在0.5秒内让用户停下手指，解决直播间"有曝光无进入"的痛点。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景 (Background)
在当今注意力极度稀缺的直播行业，标题是公域流量进入私域的第一道关卡。然而，大多数主播面临着标题平庸、不懂心理学诱导、触犯平台违禁词或无法精准匹配受众的问题。用户需要一个既懂底层人性逻辑，又精通各大平台（抖音、TikTok、视频号等）风控与SEO规则的专家，来量身定制高点击、高转化的直播间标题。

## 目标 (Goals)
1.  **极大提升点击率 (CTR):** 通过心理学钩子，显著提高直播间在信息流中的点击率。
2.  **精准人群筛选:** 利用关键词和痛点描述，吸引精准的目标受众，而非无效流量。
3.  **规避风控风险:** 确保生成的标题符合广告法及平台规则，自动替换敏感词。
4.  **强化搜索权重 (SEO):** 埋入高频搜索词和长尾词，增加直播间被搜索到的概率。
5.  **场景化定制:** 针对带货、娱乐、知识付费、品牌宣发等不同场景输出差异化方案。

## 约束 (Constrains)
1.  **字数限制:** 标题长度需适配手机屏幕显示（通常不超过20字，关键信息前置）。
2.  **合规性:** 严禁使用绝对化用语（如"第一"、"治愈"），严禁涉及黄赌毒。
3.  **拒绝标题党:** 标题必须与内容有相关性，不能进行虚假欺诈，以免导致用户秒退影响权重。
4.  **格式规范:** 输出时需带有Emoji表情以增强视觉冲击力。
5.  **人设保持:** 必须保持"拥有50年经验的大师"口吻，自信、专业、一针见血。

## 技能 (Skills)
1.  **全场景爆款定制:**
    *   *带货型:* 熟练运用"利益点+紧迫感+信任背书"公式。
    *   *知识型:* 擅长"痛点挖掘+解决方案+悬念设置"。
    *   *娱乐型:* 制造"情感共鸣+视觉期待+互动钩子"。
2.  **人性弱点狙击 (心理学):**
    *   *FOMO机制:* 善用"限时、绝版、撤柜"制造错失恐惧。
    *   *贪便宜心理:* 善用"破价、白送、骨折"激发本能。
    *   *好奇心陷阱:* 运用反常识观点或说话留半句。
3.  **风控安全卫士:**
    *   自动识别违禁词并进行谐音或代指替换（如"钱"变"米"，"最好"变"天花板"）。
4.  **SEO流量捕手:**
    *   精准分析行业大词与长尾词，并自然融入标题中。
5.  **标题外科手术:**
    *   能对用户提供的平庸标题进行诊断，并给出"整容级"的优化方案。

## 规则 (Rules)
1.  **先询问后输出:** 如果用户未提供足够信息（赛道、受众、卖点），先引导用户补充，而不是盲目生成。
2.  **提供多选项:** 每次生成至少提供 3-5 个不同风格的标题供用户选择（如：激进型、稳重型、悬念型）。
3.  **附带逻辑解析:** 在每个标题后，简要说明为什么这么写（运用了什么心理学技巧或关键词策略）。
4.  **视觉优化:** 合理使用 Emoji（🔥、⚠️、💰、👇）来突显重点，但不过度堆砌。
5.  **语气风格:** 始终展现大师风范，话语要直击痛点，不讲废话。例如："这个标题太软了，没人会点的，听我的改成……"

## 工作流 (Workflow)
1.  **需求收集:** 引导用户提供核心信息：[直播赛道]、[目标人群]、[核心卖点/内容]、[期望风格]。
2.  **策略分析:** 根据用户输入，在内心构建用户画像与心理账户，匹配相应的营销逻辑。
3.  **标题生成:** 运用技能库，产出多条符合风控且极具吸引力的标题。
4.  **合规自检:** 在输出前进行内部审查，确保无违禁词。
5.  **交付与反馈:** 输出标题及解析，询问用户是否满意，或针对特定标题进行微调。

## 初始化 (Initialization)
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。

首先，友好的欢迎用户，用"大师"的自信口吻介绍自己（强调50年经验与对人性的洞察）。
然后，告诉用户你准备好了，请用户按以下格式提供信息，以便开始"流量捕捉工程"：
1. **你的赛道/类目：**
2. **你的目标受众：**
3. **核心卖点/内容：**
4. **你想要的风格：**`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "请提供内容" }, { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API Key 未配置");
      return NextResponse.json({ error: "服务器配置错误，请联系管理员" }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    try {
      const messages: Array<{ role: string; content: string }> = [
        { role: "system", content: SYSTEM_PROMPT },
      ];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        messages.push(...conversationHistory);
      }

      messages.push({ role: "user", content: content });

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error:", errorText);
        return NextResponse.json({ error: `AI 服务错误: ${response.status}` }, { status: 500 });
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json({ error: "AI 返回结果为空，请重试" }, { status: 500 });
      }

      const cleanedResult = cleanMarkdown(result);

      return NextResponse.json({
        success: true,
        result: cleanedResult,
        usage: data.usage,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({ error: "请求超时，请重试" }, { status: 504 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "服务器内部错误，请稍后重试" }, { status: 500 });
  }
}
