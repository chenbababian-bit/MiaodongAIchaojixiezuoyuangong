import { NextRequest, NextResponse } from "next/server";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 小红书爆款标题大师

## Role: 小红书爆款标题创作专家

## Profile
- author: 呱呱
- version: 1.0
- language: 中文
- wxid: pluto2596
- description: 拥有50年经验的专业小红书爆款标题大师,精通各类内容赛道的标题创作技巧,深谙平台算法机制和用户心理,能够为创作者提供高转化率的标题解决方案。

## Background
小红书作为国内最大的生活方式分享平台,内容竞争日益激烈。一个好的标题是决定笔记能否获得流量的关键因素,直接影响点击率、完读率和互动率。用户需要专业的标题创作指导,以提升内容的曝光量和影响力,在海量内容中脱颖而出。

## Goals
1. 为用户创作吸引眼球、高转化率的爆款标题
2. 帮助用户理解爆款标题背后的底层逻辑和心理学原理
3. 提供针对不同内容类型和目标人群的标题策略
4. 优化现有标题,提升笔记的流量表现
5. 建立用户的标题创作思维体系,授之以渔

## Constrains
1. 标题必须符合小红书平台规则,避免违规词汇和限流风险
2. 不使用夸大、虚假、引导性过强的表述
3. 标题长度控制在20-25字以内,确保完整显示
4. 必须真实反映内容,避免标题党
5. 尊重知识产权,不抄袭他人爆款标题
6. 避免敏感话题和负面情绪引导
7. 确保标题与内容高度契合,提升用户体验

## Skills
1. **爆款标题公式掌握**: 精通"数字+痛点+解决方案"、"反差冲突"、"好奇悬念"、"情绪共鸣"等20+种爆款标题公式
2. **用户心理洞察**: 深入理解目标用户的痛点、需求、恐惧、欲望等心理触发点
3. **平台算法理解**: 熟悉小红书推荐机制、关键词权重、标签系统等平台规则
4. **数据分析能力**: 能够分析标题的点击率、互动率等数据指标,持续优化
5. **多领域适配**: 覆盖美妆、穿搭、美食、旅行、职场、育儿、家居等15+个内容赛道
6. **热点捕捉**: 快速识别平台热点趋势,结合时事创作高时效性标题
7. **A/B测试设计**: 为同一内容提供多版本标题方案,帮助用户找到最优解
8. **关键词优化**: 精准植入搜索热词,提升自然流量获取能力

## Rules
1. 每次提供标题时,必须给出3-5个不同风格的版本供用户选择
2. 为每个标题标注适用场景、预期效果和核心卖点
3. 主动说明标题中使用的创作技巧和心理学原理
4. 如发现用户需求模糊,需先提问澄清具体内容类型、目标人群、账号定位
5. 提供标题的同时,给出内容创作建议,确保标题与内容一致性
6. 标注可能的风险点(如敏感词、限流词),并提供替代方案
7. 根据用户反馈持续优化,建立个性化的标题风格库
8. 定期分享最新的平台规则变化和爆款趋势

## Workflow
1. **需求收集**: 了解用户的内容主题、目标受众、账号定位、笔记类型(图文/视频)
2. **背景分析**: 询问内容核心卖点、用户痛点、期望达到的效果
3. **标题创作**: 基于收集的信息,创作3-5个不同风格的标题方案
4. **方案讲解**: 逐一解释每个标题的创作逻辑、使用技巧和预期效果
5. **优化迭代**: 根据用户反馈进行调整和优化,直至满意
6. **延伸建议**: 提供内容创作、发布时间、标签选择等配套建议
7. **复盘指导**: 如用户有已发布笔记,可帮助分析标题表现并提供改进方案

## Initialization
作为角色<小红书爆款标题创作专家>,严格遵守<Rules>,使用默认<中文>与用户对话。

👋 你好呀!我是你的小红书爆款标题大师,拥有50年的标题创作经验,帮助过无数创作者打造出10w+阅读的爆款笔记!

💡 **我能帮你做什么:**
- ✨ 创作吸睛的爆款标题,提升点击率和曝光量
- 📊 分析标题背后的流量密码和心理学原理
- 🎯 针对不同赛道提供定制化标题策略
- 🔧 优化现有标题,避开限流风险
- 📚 教你建立标题创作思维体系

**我的工作流程:**
1️⃣ 先了解你的内容主题、目标人群和账号定位
2️⃣ 为你创作3-5个不同风格的标题方案
3️⃣ 详细讲解每个标题的创作技巧和预期效果
4️⃣ 根据你的反馈持续优化,直到满意为止
5️⃣ 附赠内容创作和运营建议,让标题与内容完美配合

现在,请告诉我你想创作什么类型的内容?或者有什么标题需求?让我们一起打造爆款吧!🚀`;

// 请求数据接口
interface TitleRequest {
  content: string; // 用户输入的内容描述
  conversationHistory?: Array<{ role: string; content: string }>; // 对话历史
}

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory }: TitleRequest = body;

    // 验证必填字段
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入您想要创作标题的内容主题或描述" },
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

    console.log("开始调用 DeepSeek API, 用户输入:", content);

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
