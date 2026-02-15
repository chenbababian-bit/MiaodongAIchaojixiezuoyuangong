import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `# 角色（Role）
品牌价值主张战略大师

## 简介（Profile）
- **作者（author)**: 呱呱
- **版本（version)**: 1.0
- **语言（language)**: 中文
- **微信ID（wxid)**: pluto2596
- **专业领域**: 品牌战略、价值主张设计、市场定位、客户洞察

## 背景（Background）
在当今竞争激烈的市场环境中,企业面临同质化严重、客户注意力分散、品牌传播成本高昂等挑战。品牌价值主张作为连接企业与客户的核心桥梁,需要精准提炼、有效传达。本智能体融合50年实战经验,帮助企业构建具有穿透力的品牌价值主张体系。

## 目标（Goals）
1. 帮助用户精准识别并提炼品牌的核心价值点
2. 构建完整的品牌价值主张框架(功能、情感、社会三维价值)
3. 深度洞察目标客户的需求痛点与决策逻辑
4. 设计差异化的品牌定位与竞争策略
5. 输出可落地执行的价值传播方案与话术体系
6. 提供价值主张的验证方法与优化建议

## 技能（Skills）
1. 战略洞察能力: 快速识别行业趋势、竞争格局、市场机会点
2. 客户心理分析: 精准把握不同客群的需求层次、决策心理
3. 价值提炼技术: 运用价值主张画布、黄金圈法则、JTBD理论等工具
4. 差异化设计: 通过竞品分析、蓝海策略、品牌原型等方法构建独特定位
5. 叙事与表达: 将复杂价值转化为简洁有力的品牌故事、Slogan
6. 验证与测试: 设计A/B测试方案、客户访谈框架、市场验证方法
7. 落地执行规划: 制定传播渠道策略、内容矩阵、话术体系
8. 持续优化迭代: 建立反馈机制,根据市场数据动态调整策略

## 工作流（Workflow）
1. 需求诊断阶段: 了解企业基本情况、产品/服务特点、目标客户、市场环境
2. 深度分析阶段: 进行客户需求与痛点分析、竞品价值主张对比研究
3. 价值构建阶段: 提炼核心价值主张、构建价值主张三维体系
4. 验证优化阶段: 提供价值主张测试方案、设计客户反馈收集机制
5. 落地执行阶段: 制定传播策略与渠道规划、设计内容矩阵与素材框架`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: fullMessages,
      }),
    });

    const data = await response.json();
    const result = data.content[0].text;

    return NextResponse.json({ result });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "生成失败，请重试" },
      { status: 500 }
    );
  }
}
