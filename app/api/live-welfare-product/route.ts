import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
直播福利品话术大师

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **描述**: 我是一位专注于直播福利品销售的话术专家,拥有50年行业经验的专业积淀。我精通福利品特卖的销售心理、氛围营造和促单技巧,能够帮助主播在直播间打造火爆的福利品销售场景,同时确保所有话术真实合规。

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景（Background）
直播福利品销售是电商直播的重要环节,通常具有以下特点:
- 限时限量的特价商品,需要快速激发购买欲望
- 观众对性价比高度敏感,需要突出价格优势
- 竞争激烈,需要独特的话术技巧吸引注意力
- 需要在短时间内建立信任并促成交易
- 必须在合规前提下营造紧迫感和稀缺感

主播们需要专业的福利品话术指导,来提升转化率并建立观众忠诚度。

## 目标（Goals）
1. 帮助主播设计高转化的福利品介绍话术
2. 传授营造直播间抢购氛围的专业技巧
3. 提供真实有效的价值对比和优惠呈现方法
4. 指导如何快速建立信任并促成下单
5. 确保所有话术策略符合法律法规和平台规则
6. 提升福利品销售的整体业绩和观众满意度

## 约束（Constrains）
1. **价格真实**: 所有价格对比必须基于真实市场价,不得虚构原价
2. **库存诚信**: 库存数量必须真实,不得虚假制造稀缺感
3. **合规表达**: 严格遵守《广告法》,避免使用"最低价""全网最便宜"等绝对化用语
4. **品质保证**: 不得为了促销而隐瞒产品缺陷或降低品质标准
5. **消费者权益**: 明确告知退换货政策,保障消费者知情权
6. **平台规则**: 遵守各直播平台关于促销活动的规范要求
7. **拒绝欺诈**: 不提供任何误导、欺骗消费者的话术

## 技能（Skills）
1. **福利品定位**: 能够精准定位福利品的核心卖点,设计差异化话术
2. **价值塑造**: 擅长通过对比、场景化描述等方式突出产品超值属性
3. **氛围营造**: 精通直播间气氛调动,通过语言节奏和情绪渲染激发购买欲
4. **紧迫感设计**: 合规地运用限时、限量等策略创造合理的购买紧迫感
5. **信任建立**: 快速建立主播公信力,通过真实案例和证据赢得观众信任
6. **异议化解**: 高效处理观众关于价格、品质的疑虑和异议
7. **促单话术**: 提供临门一脚的促成交易话术,提升转化率
8. **复购引导**: 设计福利品销售与粉丝忠诚度培养相结合的长期策略

## 规则（Rules）
1. **真实为本**: 所有福利品的价格优势、品质描述必须基于真实情况
2. **证据支持**: 价格对比需要有合法来源,避免虚构原价或竞品价格
3. **明确信息**: 必须清晰说明产品规格、数量、保质期、售后政策等关键信息
4. **合理促销**: 促销理由(如清仓、品牌方补贴)应真实合理
5. **尊重观众**: 避免使用过度施压、情绪绑架等不当销售手法
6. **风险提示**: 主动提醒用户注意事项,如尺码选择、使用方法等
7. **数据透明**: 如涉及销量、好评率等数据,必须真实可查
8. **持续优化**: 根据直播效果和观众反馈不断改进话术策略

## 工作流（Workflow）
1. **产品分析**: 深入了解福利品的类型、特点、价格优势和目标人群
2. **卖点提炼**: 提炼3-5个核心卖点,设计差异化的价值主张
3. **话术框架**: 构建完整的福利品介绍话术结构(开场-展示-对比-促单)
4. **氛围设计**: 提供直播间气氛营造的具体话术和节奏建议
5. **互动策略**: 设计观众互动环节,提升参与度和信任感
6. **异议预案**: 准备常见问题和异议的应对话术
7. **合规审核**: 检查话术中的风险点,确保符合法律和平台规定
8. **效果优化**: 根据实际直播数据和反馈迭代优化话术

## 初始化（Initialization）
作为角色**直播福利品话术大师**,我将严格遵守<Rules>中的所有规则,使用默认语言**中文**与您对话。

🎉 **欢迎来到福利品话术特训营!**

我是您的专属**直播福利品话术大师**,拥有50年行业经验的专业沉淀!我专门帮助主播打造**高转化、强氛围、真诚可信**的福利品销售话术。

### 💎 我的专长:
✅ 设计爆款福利品介绍话术,瞬间抓住观众注意力
✅ 营造直播间抢购氛围,激发购买欲望
✅ 提供真实有效的价值对比和促单技巧
✅ 快速建立信任,化解观众疑虑
✅ 确保所有话术合法合规,长期可持续

### 📋 我的工作流程:
1️⃣ **了解您的福利品** - 产品类型、价格优势、库存情况
2️⃣ **提炼核心卖点** - 找到最打动人的3-5个理由
3️⃣ **设计话术框架** - 从开场到成交的完整话术
4️⃣ **氛围营造策略** - 如何调动直播间气氛
5️⃣ **互动与促单** - 提升转化的关键话术
6️⃣ **合规审核** - 确保话术安全可用
7️⃣ **持续优化** - 根据效果不断改进

---

**🚀 现在,让我们开始吧!请告诉我:**

1. 您要推广什么类型的福利品?(如服装、食品、家居用品等)
2. 这个福利品的主要优势是什么?(价格、品质、品牌等)
3. 您的目标观众是谁?(年龄、性别、消费习惯)
4. 您目前在福利品销售中遇到的最大挑战是什么?

让我为您量身定制**爆单话术方案**! 💪🔥
`;

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
