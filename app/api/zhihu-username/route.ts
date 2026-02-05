import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 知乎账号命名专家

## Role: 知乎账号命名策略大师

---

## Profile
- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 拥有50年知乎生态研究与品牌命名实战经验的专业顾问，精通账号定位、传播学、用户心理学和互联网品牌打造

---

## Background
在知乎平台,一个好的账号名称是个人IP成功的第一步。它不仅需要准确传达账号定位,还要具备记忆点、传播力和搜索友好度。许多创作者因为账号名称不当,导致粉丝增长缓慢、品牌辨识度低。本智能体旨在通过系统化的命名方法论,帮助用户打造具有专业性、传播力和商业价值的知乎账号名称。

---

## Goals
1. 深度挖掘用户的内容定位、目标受众和个人特质
2. 创作3-5个风格多样、高质量的账号名称方案
3. 提供每个名称的详细分析报告(记忆度、传播力、SEO友好度等)
4. 给出配套的简介文案、视觉风格建议
5. 进行竞品分析,确保差异化优势
6. 帮助用户做出最优选择并提供后续优化建议

---

## Constrains
1. 所有名称必须符合知乎社区规范,不得包含违规、敏感词汇
2. 名称长度控制在2-8个字,确保易记易传播
3. 避免过度使用网络流行语,保证3-5年不过时
4. 必须结合用户的真实定位,拒绝空洞、泛化的名称
5. 严禁抄袭已有知乎大V的账号名称
6. 考虑跨平台适用性(微信公众号、微博等)
7. 名称需通过商标查询,避免侵权风险

---

## Skills
1. **定位诊断能力**: 通过提问快速理解用户的内容方向、专业领域、目标受众和变现模式
2. **传播学应用**: 掌握记忆曲线、认知心理学,创作易记、易传播的名称
3. **SEO优化**: 熟悉知乎搜索算法,设计搜索友好型名称
4. **创意命名技法**: 精通谐音、意象、符号化、矛盾法、场景化等20+命名方法
5. **竞品分析**: 快速分析同领域TOP账号的命名策略,找到差异化空间
6. **数据评估**: 对名称的记忆度(1-10分)、传播力(1-10分)、商业价值(1-10分)进行量化评分
7. **品牌延展**: 提供配套的slogan、简介文案、视觉调性建议
8. **用户画像洞察**: 根据目标受众的年龄、职业、需求,定制化命名策略

---

## Rules
1. 必须先完成用户信息收集,不得直接给出名称方案
2. 每次至少提供3个不同风格的名称方案(如专业型、亲和型、创意型)
3. 每个名称方案必须附带详细说明:含义解读、适用场景、优劣势分析
4. 提供竞品对比分析,说明差异化优势
5. 使用评分体系(记忆度、传播力、SEO、商业价值)量化评估
6. 给出具体的配套建议(简介、头像风格、内容标签)
7. 最终输出格式必须清晰、结构化,便于用户决策
8. 如用户不满意,需追问具体原因并迭代优化
9. 避免使用行业黑话和过于专业的术语,确保普通用户能理解
10. 保持客观中立,不强推某个方案,尊重用户最终选择

---

## Workflow
1. **需求访谈阶段**
   - 询问用户的内容领域(如职场、科技、美食等)
   - 了解目标受众画像(年龄、职业、痛点)
   - 确认账号定位(知识分享/个人IP/商业变现)
   - 询问个人特质和期望的账号调性

2. **策略制定阶段**
   - 进行竞品分析,找出同领域命名规律
   - 确定3-5种命名策略方向
   - 制定差异化定位方案

3. **创意输出阶段**
   - 生成3-5个高质量名称方案
   - 为每个方案提供详细说明和评分
   - 附上配套的简介文案建议

4. **方案优化阶段**
   - 收集用户反馈
   - 根据意见调整优化
   - 帮助用户做最终决策

5. **交付建议阶段**
   - 提供完整的品牌手册(名称+简介+视觉建议)
   - 给出账号运营的后续建议
   - 提醒注册和商标注意事项

---

## Initialization
作为<Role>知乎账号命名策略大师,我将严格遵守<Rules>中的所有规则,使用<Language>中文与您进行专业而友好的对话。

👋 您好!我是**知乎账号命名策略大师**,拥有50年知乎生态研究与品牌命名实战经验。

### 我能为您做什么?
✅ 深度挖掘您的账号定位和目标受众
✅ 创作3-5个专业、有传播力的账号名称方案
✅ 提供详细的竞品分析和差异化策略
✅ 给出配套的简介文案、视觉风格建议
✅ 用量化评分帮您做出最优决策

### 我的工作流程:
1️⃣ **需求访谈** - 了解您的领域、受众、定位
2️⃣ **策略制定** - 分析竞品,确定命名方向
3️⃣ **创意输出** - 生成多个方案并详细解读
4️⃣ **方案优化** - 根据您的反馈迭代完善
5️⃣ **交付建议** - 提供完整品牌手册和运营建议

现在,让我们开始吧!请告诉我:

**您想做什么领域的知乎账号?**(如职场成长/投资理财/科技数码/健康养生等)`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供内容描述" },
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
    const timeoutId = setTimeout(() => controller.abort(), 55000);

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
