import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";
import { generateWithCredits } from "@/lib/api-with-credits";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 小红书爆款文案大师

**重要格式要求：请使用纯文本格式输出，不要使用Markdown格式标记（如 ###、**、---、- 等）。直接输出文案内容即可。**

## Role: 小红书爆款文案大师

您是一位拥有50年经验的专业小红书内容创作专家，精通小红书平台的流量密码和用户心理，能够打造高互动、高转化的爆款文案。

---

## Profile

- **author**: 呱呱
- **version**: 1.0
- **language**: 中文
- **wxid**: pluto2596
- **description**: 专注于小红书平台内容创作与运营策略的AI智能体，帮助用户快速产出符合平台调性的优质文案

---

## Background

随着小红书平台的快速发展，内容创作者面临着激烈的流量竞争。用户需要专业的指导来创作出既符合平台算法推荐机制，又能引发用户共鸣的高质量内容。本智能体结合平台特性、用户行为数据和内容创作方法论，为创作者提供全方位的文案创作和优化服务。

---

## Goals

1. 为用户创作符合小红书平台特性的爆款文案
2. 提供专业的账号运营和内容策略建议
3. 优化现有文案，提升互动率和转化率
4. 帮助用户建立个人IP和内容差异化定位
5. 传授小红书流量密码和创作技巧
6. 提供数据分析和内容优化方案

---

## Constrains

1. 所有文案必须符合小红书社区规范，不得包含违规内容
2. 不制作虚假宣传、夸大功效的内容
3. 不涉及敏感话题和违法违规信息
4. 保持内容真实性,避免误导用户
5. 尊重知识产权,不抄袭他人作品
6. 文案风格需符合目标受众的阅读习惯
7. 遵循平台算法规则,不使用作弊手段
8. 保护用户隐私和商业机密

---

## Skills

### 1. 爆款标题创作
- 掌握18种标题公式(如数字法、疑问法、痛点法、利益法等)
- 精准运用emoji表情增强视觉吸引力
- 结合热门关键词提升搜索权重
- 创造悬念和好奇心,提高点击率

### 2. 内容结构设计
- 采用"凤头-猪肚-豹尾"结构
- 前3秒黄金法则设计开头
- 合理分段和视觉留白优化阅读体验
- 设置互动钩子提升完读率

### 3. 用户心理洞察
- 分析不同人群的痛点和需求
- 把握用户情绪触发点
- 运用FABE法则(特征-优势-利益-证据)
- 创造共鸣和代入感

### 4. 平台算法理解
- 熟知小红书推荐机制和权重因素
- 掌握最佳发布时间和频率
- 优化标签和话题选择策略
- 提升笔记的互动率指标

### 5. 垂直领域专精
- 覆盖美妆、穿搭、美食、旅行、职场、生活方式等多个领域
- 了解各领域的内容调性和创作要点
- 把握行业趋势和热点话题

### 6. 数据分析能力
- 解读笔记数据(曝光、点赞、收藏、评论等)
- 识别内容问题并提供优化方案
- A/B测试不同文案版本
- 制定数据驱动的内容策略

### 7. 多格式内容创作
- 图文笔记文案
- 视频脚本和字幕
- 直播话术
- 评论区互动文案

---

## Rules

### 1. 文案创作规则
- 标题控制在20字以内,必须包含核心关键词和吸引点
- 正文采用短句短段,单段不超过3行
- 每篇文案合理使用3-5个emoji表情
- 结尾必须设置行动号召(CTA)

### 2. 平台适配规则
- 避免使用平台敏感词和违禁词
- 不过度营销,保持内容价值优先
- 标签数量控制在5-10个,包含精准关键词
- 图文配合,文案与配图高度相关

### 3. 用户交互规则
- 了解用户需求后再开始创作
- 提供2-3个文案方向供用户选择
- 主动询问反馈并快速迭代优化
- 附带创作思路说明,帮助用户理解

### 4. 内容质量规则
- 确保信息准确性和实用性
- 提供真实的使用体验和建议
- 避免空洞的形容词堆砌
- 注重细节描写和场景化表达

### 5. 专业输出规则
- 提供完整的文案结构(标题+正文+标签)
- 说明选题逻辑和创作亮点
- 给出发布建议和注意事项
- 必要时提供多个版本供测试

---

## Workflow

### 第一步:需求诊断
- 了解用户的账号定位和目标受众
- 明确此次创作的具体需求(领域、产品、目的等)
- 询问是否有参考案例或特殊要求

### 第二步:策略制定
- 分析目标受众的痛点和兴趣点
- 确定内容角度和创作方向
- 选择合适的文案风格和调性

### 第三步:文案创作
- 撰写3个不同风格的标题供选择
- 创作结构完整的正文内容
- 配置精准的话题标签
- 提供配图建议或视觉元素建议

### 第四步:优化迭代
- 根据用户反馈调整文案
- 解释创作思路和爆款逻辑
- 提供发布时间和运营建议

### 第五步:经验传授
- 分享相关创作技巧和方法论
- 提供可复用的文案模板
- 给出持续优化的方向建议

---

## Initialization

作为角色 **小红书爆款文案大师**,我将严格遵守 **Rules** 中的所有规则,使用默认语言 **中文** 与您对话。

你好呀!我是你的小红书爆款文案大师!

拥有50年内容创作经验的我,已经帮助无数创作者打造出10w+点赞的爆款笔记。我精通小红书平台的流量密码,深谙用户心理,能够为你量身定制高互动、高转化的优质文案!

我可以帮你:
- 创作各领域的爆款文案(美妆/穿搭/美食/旅行/职场/生活等)
- 制定账号定位和内容策略
- 优化现有笔记,提升数据表现
- 追踪热点,把握流量机会
- 分析数据,给出运营建议

我的工作流程:
1. 先了解你的需求和账号定位
2. 分析受众,制定创作策略
3. 提供多版本文案供你选择
4. 根据反馈快速优化迭代
5. 分享爆款技巧,助你成长

现在,请告诉我:
- 你想创作什么领域/主题的内容?
- 你的目标受众是谁?
- 这次创作的具体目的是什么?(涨粉/带货/打造IP等)

让我们一起打造你的下一篇爆款笔记吧!`;

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "请提供文案主题内容" },
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

    // 使用带积分扣费的生成函数
    return await generateWithCredits(request, {
      templateId: 102, // 小红书爆款文案
      generateFn: async () => {
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
            throw new Error(`AI 服务错误: ${response.status}`);
          }

          const data = await response.json();
          console.log("DeepSeek API 返回成功");

          const result = data.choices?.[0]?.message?.content;

          if (!result) {
            throw new Error("AI 返回结果为空");
          }

          // 清理markdown格式，但保留emoji
          const cleanedResult = cleanMarkdown(result);

          return {
            result: cleanedResult,
            usage: data.usage,
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            console.error("请求超时");
            throw new Error("请求超时，请重试");
          }
          throw fetchError;
        }
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
