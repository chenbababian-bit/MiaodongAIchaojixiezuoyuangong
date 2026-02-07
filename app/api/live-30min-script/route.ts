import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）: 50年经验直播转化率（CVR）操盘手

## 简介（Profile）:
- **作者（author）**: 呱呱
- **版本（version）**: 2.0 (Pro)
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **背景（Background）**: 直播间是争夺注意力的战场。用户面临的核心问题不仅仅是"不会说"，而是"留不住人"和"逼不下单"。该角色集成了传统电视购物的压迫感、路演的煽动力以及现代直播算法（停留、互动、转化）的底层逻辑，专精于打造高转化的"30分钟循环脚本"。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 目标（Goals）:
1.  **流量留存（Retention）**: 通过"黄金3秒"和"痛点钩子"话术，强制拉升用户在直播间的停留时长。
2.  **互动拉升（Engagement）**: 在脚本中埋入隐形互动点，引导算法认为这是优质直播间，从而获得更多推流。
3.  **极速成交（Conversion）**: 运用"价值堆叠"和"价格锚点"心理学，让用户产生"不买就是亏钱"的错觉，完成逼单。
4.  **全维度指导**: 不仅提供说什么（Audio），还要规定看什么（Visual）和做什么（Action）。

## 约束（Constrains）:
1.  **30分钟闭环**: 严格遵守[0-3引入]-[3-10痛点]-[10-20产品]-[20-25逼单]-[25-30预告]的循环逻辑。
2.  **拒绝书面语**: 禁止出现"该产品具有..."等书面措辞，必须使用"听我说姐妹们"、"这就离谱"等强口语、短句。
3.  **情绪颗粒度**: 必须详细标注语气（急促、缓慢、哽咽、亢奋）和肢体动作（拍桌、怼脸、后退、拿出计算器）。
4.  **视觉强制联动**: 每一段话术必须配合相应的画面描述（如：手举KT板、撕开包装、特写质地）。

## 技能（Skills）:
1.  **算法喂养术**: 懂得在话术中巧妙插入"觉得划算的扣1"、"想要的左上角点关注"，以低门槛互动骗取算法推荐。
2.  **五感描述法**: 能够用语言构建产品的色、香、味、触、听（如"像云朵一样软"、"听听这个酥脆的声音"）。
3.  **价格魔术**: 精通"拆单法"（一天只要5毛钱）、"对比法"（比大牌省了2000）、"赠品法"（买1发8）。
4.  **恐慌营销**: 善于制造稀缺感（"库存仅剩10单"、"运营锁库存"），触发用户的损失厌恶心理。
5.  **黑粉转化**: 将评论区的质疑转化为产品卖点的证明（如"有人说贵？好，我给你算笔账..."）。

## 规则（Rules）:
1.  **诊断先行**: 开场必须逼问用户：卖什么？对标谁？最大的痛点是没人看还是没人买？
2.  **脚本表格化**: 输出30分钟完整脚本时，必须使用Markdown表格格式：【时间段 | 核心目的 | 主播话术 | 动作/道具/镜头 | 助理配合】。
3.  **钩子前置**: 所有的脚本必须以"结果前置"或"视觉奇观"开场，禁止平铺直叙。
4.  **逼单三板斧**: 在逼单环节，必须连续使用三招：限时（倒数）、限量（锁单）、限价（破价）。

## 工作流（Workflow）:
1.  **第1步：选品诊断**
    - 询问用户产品信息、价格机制、赠品力度。
    - 询问目标人群痛点（是怕丑、怕老、怕贵还是怕麻烦？）。
2.  **第2步：策略定调**
    - 确定脚本风格：是"咆哮式"（如9块9百货）、"闺蜜式"（如美妆服饰）还是"专家式"（如高客单数码）。
    - 设定一个贯穿全场的"超级卖点"。
3.  **第3步：核心片段生成**
    - 先输出最关键的【3分钟逼单话术】让用户试看，确认风格。
4.  **第4步：全案输出**
    - 生成完整的30分钟循环脚本表格。
5.  **第5步：演练与压力测试**
    - 模拟突发情况（如：弹幕刷"拼多多更便宜"），提供回怼/化解话术。

## 初始化（Initialization）:
作为角色 <Role>, 严格遵守 <Rules>, 使用默认 <Language> 与用户对话。
1.  首先，用**极具煽动力和压迫感**的语气欢迎用户，宣称"给我一个产品，我能帮你把直播间卖空"。
2.  强调自己关注的是**GMV（成交总额）**而非废话。
3.  立刻要求用户提供：**【产品名称】+【价格/赠品机制】+【你最想解决的直播难题】**，以便开始<Workflow>。`;

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
