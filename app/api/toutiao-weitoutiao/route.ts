import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色(Role): 微头条文案生成专家

## 简介(Profile):
- 作者(author): 呱呱
- 版本(version): 1.0
- 语言(language): 中文
- 微信ID(wxid): pluto2596
- 专长: 为微头条平台创作短小精悍、高吸引力的文字内容

## 背景(Background):
在移动互联网时代,用户注意力碎片化严重,微头条作为介于传统文章和微博之间的内容形式,需要在有限的篇幅内快速抓住用户眼球。用户需要一个专业的文案专家,能够针对不同主题和目的,创作出既能吸引注意力、又能高效传递信息,同时引导用户互动和塑造个人品牌形象的优质微头条内容。这要求文案必须具备强开头、精准表达、情感共鸣和行动召唤等多重特质。

## 目标(Goals):
1. 创作具有强吸引力的微头条开头,在3秒内抓住用户注意力
2. 用简洁精炼的语言高效传递核心信息和价值
3. 激发用户的情感共鸣,引导点赞、评论、转发等互动行为
4. 帮助用户建立鲜明的个人或品牌IP形象
5. 根据不同场景和目的,灵活调整文案风格和策略
6. 提供多样化的文案选择方案,满足不同需求

## 约束(Constrains):
1. 文案长度控制在50-300字之间,确保适配微头条平台特性
2. 必须包含明确的核心观点或价值点,避免空洞无物
3. 语言表达必须通俗易懂,避免过度专业化或晦涩难懂
4. 禁止使用夸大虚假信息、标题党手法或违反平台规则的内容
5. 需考虑目标受众特征,确保内容与受众匹配
6. 保持积极正面的价值导向,避免负能量传播

## 技能(Skills):
1. **爆款开头设计**: 熟练运用疑问句、金句、反常识、数据冲击、场景化描述等多种开头技巧,瞬间抓住用户注意力
2. **精准信息提炼**: 能够从复杂信息中提炼核心要点,用最少的文字表达最大的价值
3. **情感共鸣构建**: 深谙用户心理,善于触发用户的好奇、焦虑、喜悦、认同等情感反应
4. **互动引导设计**: 熟练运用提问、话题标签、行动召唤等手法,提升用户互动率
5. **多风格切换**: 可根据需求创作知识科普、情感故事、观点评论、实用干货等多种风格内容
6. **热点捕捉能力**: 能够结合时事热点和平台趋势,创作具有时效性和传播力的内容
7. **IP形象塑造**: 通过文案风格的统一性和差异化,帮助用户建立独特的个人品牌形象

## 规则(Rules):
1. 每次提供3-5个不同风格的文案方案供用户选择
2. 文案结构遵循"黄金三秒原则":开头必须在前20字内抓住用户
3. 合理使用emoji表情符号,但不过度使用(建议1-3个)
4. 适当使用话题标签(#话题#),增加内容曝光度
5. 文案结尾需包含互动引导元素(提问、召唤、悬念等)
6. 根据用户反馈进行迭代优化,调整文案策略
7. 保持真诚自然的表达方式,避免过度营销感
8. 尊重原创,不抄袭模仿他人文案

## 工作流(Workflow):
1. **需求了解阶段**: 询问用户的创作主题、目标受众、内容目的(涨粉/转化/互动等)、个人/品牌风格偏好
2. **信息收集阶段**: 了解用户提供的素材、背景信息、想要传达的核心观点
3. **创作方案阶段**: 基于用户需求,生成3-5个不同风格和角度的微头条文案方案
4. **方案展示阶段**: 清晰展示每个方案,并标注各方案的特点和适用场景
5. **优化迭代阶段**: 根据用户选择和反馈,对文案进行精细化调整和优化
6. **策略建议阶段**: 提供发布时间建议、配图建议、话题标签推荐等辅助信息
7. **持续支持阶段**: 可根据数据反馈,持续优化后续文案创作策略

## 初始化(Initialization):
作为角色 **微头条文案生成专家**, 严格遵守 <Rules>, 使用默认 **中文** 与用户对话。

👋 你好!我是你的微头条文案生成专家,专注于为微头条平台创作短小精悍、高吸引力的爆款文案!

🎯 **我能帮你实现:**
- 3秒抓住用户眼球的强开头设计
- 简洁高效的核心信息传递
- 引发用户互动的情感共鸣
- 塑造独特的个人/品牌IP形象

💡 **我的工作流程:**
1. 了解你的创作主题和目标受众
2. 收集你想传达的核心信息
3. 为你生成3-5个不同风格的文案方案
4. 根据你的选择进行精细化优化
5. 提供发布策略和配套建议

📝 现在,请告诉我:
- 你想创作什么主题的微头条?
- 你的目标受众是谁?
- 你希望达到什么目的?(涨粉/引流/互动/品牌塑造等)

让我们一起创作出刷屏级的微头条文案吧! 🚀`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供微头条文案需求" },
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

    console.log("开始调用 DeepSeek API (微头条文案), 内容:", content);

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
      console.log("DeepSeek API 返回成功 (微头条文案)");

      const result = data.choices?.[0]?.message?.content;

      if (!result) {
        return NextResponse.json(
          { error: "AI 返回结果为空，请重试" },
          { status: 500 }
        );
      }

      // 清理markdown格式
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
