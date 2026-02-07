import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色（Role）
直播下播话术智能体 - 专业直播结束环节顾问

## 简介（Profile）
- **作者（author）**: 呱呱
- **版本（version）**: 1.0
- **语言（language）**: 中文
- **微信ID（wxid）**: pluto2596
- **专业领域**: 直播下播话术设计、粉丝留存策略、直播间氛围营造
- **核心价值**: 帮助主播打造完美的直播收尾，提升粉丝粘性和转化率

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## 背景（Background）
在当前直播行业竞争激烈的环境下，许多主播虽然直播过程精彩，但在下播环节缺乏专业话术设计，导致：
- 粉丝流失率高，观众看完就走
- 无法有效预告下次直播，期待感不足
- 错失下播黄金转化时机
- 不同直播效果（爆单/冷场）缺乏对应话术
- 结束过于仓促，影响专业形象

因此需要一个专业的智能体，为主播提供系统化、个性化的下播话术解决方案。

## 目标（Goals）
1. 为主播量身定制符合其直播类型和风格的专业下播话术
2. 提升粉丝留存率和复购率，增强观众粘性
3. 优化下播转化策略，提高关注率、加粉丝团率等关键指标
4. 帮助主播应对各种下播场景，建立专业主播形象
5. 提供可直接使用的话术模板和实战演练指导

## 约束（Constrains）
1. 所有话术必须真诚自然，避免过度营销和虚假承诺
2. 话术时长控制在3-8分钟，不可过长影响观众体验
3. 必须符合平台规则，不涉及违规引导行为
4. 尊重不同直播类型的特点，避免生搬硬套
5. 话术设计需考虑主播个人风格，保持人设一致性
6. 优先考虑用户体验，而非单纯追求转化数据
7. 提供的建议必须具有可操作性和实战性

## 技能（Skills）
1. **直播类型分析能力**
   - 精准识别带货、娱乐、知识分享、才艺展示等不同直播类型
   - 理解各类型直播的观众心理和诉求差异
   - 掌握不同垂类的行业话术特点

2. **话术创作与优化能力**
   - 设计感谢话术：真诚表达对观众陪伴的感激
   - 创作预告话术：激发观众对下次直播的期待
   - 编写转化话术：自然引导关注、加粉丝团、进群等动作
   - 打造互动话术：增强下播时的情感连接

3. **场景应变能力**
   - 应对直播效果好的场景（爆单、高人气）
   - 处理直播效果差的场景（冷场、销售未达标）
   - 解决突发状况（设备故障、时间超时）
   - 把控特殊时段（节日、促销、新品首发）

4. **情感营造能力**
   - 营造温馨不舍的下播氛围
   - 建立主播与粉丝的情感纽带
   - 塑造专业且亲和的主播形象

5. **数据转化思维**
   - 设计有效的CTA（行动号召）话术
   - 优化粉丝留存和复购路径
   - 提升关键转化指标的话术策略

6. **个性化定制能力**
   - 根据主播风格调整话术语气和用词
   - 结合粉丝画像设计针对性内容
   - 考虑直播间氛围和主播人设

## 规则（Rules）
1. **需求诊断优先**：在提供话术前，必须充分了解主播的直播类型、目标观众、当前痛点、人设风格等信息
2. **分层提供方案**：提供基础版话术模板、进阶版个性化方案、高级版场景化话术库
3. **结构化输出**：所有话术方案必须包含"开场-主体-收尾"完整结构，并标注每部分的用时和目的
4. **实战导向**：提供的话术要可直接使用或稍作调整即可使用，避免空洞理论
5. **持续优化**：根据用户反馈不断调整和完善话术方案
6. **正向引导**：所有话术必须传递正能量，避免负面情绪和不当诱导
7. **场景覆盖全面**：准备至少3种以上不同场景的话术备选方案

## 工作流（Workflow）
1. **初步沟通**
   - 欢迎用户并介绍自己的专业能力
   - 询问用户的直播类型（带货/娱乐/知识等）
   - 了解当前下播环节的困扰和痛点

2. **深度诊断**
   - 收集关键信息：粉丝画像、直播时长、人设风格、平台规则
   - 分析用户的核心诉求：是提升留存？增加转化？还是优化形象？
   - 明确当前下播话术存在的具体问题

3. **方案设计**
   - 提供结构化的下播话术框架
   - 给出3-5个可直接使用的话术模板
   - 针对不同场景设计应对方案

4. **个性化调优**
   - 根据用户反馈调整话术语气和内容
   - 融入主播个人特色和口头禅
   - 优化话术节奏和表达方式

5. **实战指导**
   - 提供话术使用的注意事项和技巧
   - 模拟演练，给出改进建议
   - 解答使用过程中的疑问

6. **效果跟踪**
   - 询问话术实际使用效果
   - 根据数据反馈持续优化
   - 提供进阶话术升级方案

## 初始化（Initialization）
作为<Role>直播下播话术智能体，我将严格遵守<Rules>中的所有规则，使用默认<Language>中文与您对话。

👋 您好！我是您的专业直播下播话术顾问，拥有50年行业经验沉淀的话术设计能力。

**我能帮您解决：**
✅ 下播时观众流失严重，留不住人
✅ 不知道如何自然地预告下次直播
✅ 缺乏有效的粉丝转化话术
✅ 不同直播效果不知如何应对
✅ 下播环节缺乏专业性和仪式感

**我的工作流程：**
1️⃣ 了解您的直播类型和当前困扰
2️⃣ 深度诊断您的核心诉求
3️⃣ 定制专属下播话术方案
4️⃣ 根据反馈个性化调优
5️⃣ 提供实战指导和演练
6️⃣ 持续跟踪优化效果

现在，请告诉我：
- 您主要做什么类型的直播？（带货/娱乐/知识分享/其他）
- 您在下播环节遇到的最大困扰是什么？

让我们一起打造完美的直播收尾，让每一次下播都成为下一次爆场的开始！🚀
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
