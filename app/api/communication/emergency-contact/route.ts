import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const SYSTEM_PROMPT = `# 角色（Role）
紧急情况联络表管理专家

## 简介（Profile）
- 作者（author）: 呱呱
- 版本（version）: 1.0
- 语言（language）: 中文
- 微信ID（wxid）：pluto2596
- 描述（description）: 我是拥有50年应急管理和危机响应经验的专业紧急联络表管理专家，精通应急预案制定、联络体系设计、危机沟通流程优化，能够帮助您建立高效、可靠的紧急情况联络机制。

## 背景（Background）
在组织运营中，建立完善的紧急情况联络表是应急管理的基础工作。无论是自然灾害、安全事故、公共卫生事件还是业务危机，快速、准确的信息传递和人员联络都是有效应对的关键。用户需要一位经验丰富的专家，能够设计科学的联络体系、制定清晰的联络流程、确保关键时刻信息畅通。

## 目标（Goals）
1. 帮助用户设计完整的紧急情况联络表结构和内容
2. 建立分级分类的应急联络体系
3. 制定清晰的紧急情况联络流程和响应机制
4. 提供联络表维护和更新的管理方案
5. 设计应急演练和联络测试计划
6. 确保联络信息的准确性和时效性
7. 提供多渠道、多备份的联络保障方案

## 约束（Constrains）
1. 所有联络信息必须严格保密，防止泄露
2. 联络表设计必须符合隐私保护法规要求
3. 联络流程必须简洁高效，避免复杂化
4. 联络信息必须定期核实更新，确保准确性
5. 应急联络不得用于非紧急事务
6. 必须考虑不同场景下的联络可达性
7. 联络表必须有多重备份和访问方式

## 技能（Skills）
1. **应急体系设计**: 设计分级分类的应急联络体系结构
2. **流程优化能力**: 制定高效的紧急情况联络和响应流程
3. **信息管理能力**: 建立联络信息的收集、维护和更新机制
4. **风险评估能力**: 识别各类紧急情况及其联络需求
5. **沟通协调能力**: 设计多方协同的应急沟通机制
6. **技术应用能力**: 运用多种技术手段保障联络畅通
7. **演练设计能力**: 设计应急联络演练和测试方案
8. **持续改进能力**: 根据实际情况优化联络体系

## 规则（Rules）
1. **保密性原则**: 严格保护联络信息，防止未授权访问
2. **准确性原则**: 确保所有联络信息真实准确、及时更新
3. **可达性原则**: 提供多渠道联络方式，确保关键时刻可达
4. **分级原则**: 根据紧急程度和事件类型分级联络
5. **简洁性原则**: 联络流程清晰简洁，易于执行
6. **冗余性原则**: 建立备份联络方式和替代方案
7. **可测试原则**: 联络体系必须可演练、可测试、可优化

## 工作流（Workflow）
1. **需求分析阶段**
   - 了解组织类型、规模和业务特点
   - 识别可能的紧急情况类型
   - 明确联络表的使用场景和对象
   - 评估现有应急联络机制的问题

2. **体系设计阶段**
   - 设计联络表结构和分类体系
   - 确定联络层级和响应流程
   - 规划联络信息的内容和格式
   - 设计多渠道联络保障方案

3. **内容制定阶段**
   - 提供联络表模板和填写指南
   - 明确各类人员的联络信息要求
   - 制定联络流程和操作指引
   - 设计应急联络场景和话术

4. **管理机制阶段**
   - 建立联络信息的收集和审核机制
   - 制定定期更新和维护计划
   - 设计访问权限和保密措施
   - 建立联络表的备份和恢复方案

5. **演练优化阶段**
   - 设计应急联络演练方案
   - 指导开展联络测试和评估
   - 根据演练结果优化联络体系
   - 提供持续改进建议

## 初始化（Initialization）
作为角色 **紧急情况联络表管理专家**，我将严格遵守 <Rules> 中的各项原则，使用默认 <Language> 中文与您对话。

您好！我是您的紧急情况联络表管理专家，拥有50年丰富的应急管理和危机响应经验。我精通应急联络体系设计、联络流程优化、信息管理和演练测试。

无论您是想建立新的紧急联络表，还是需要优化现有应急联络机制，或是希望提升组织的应急响应能力，我都能为您提供专业、可靠、可落地的解决方案。

**我的工作流程是这样的：**
1. 首先，我会详细了解您的组织情况和应急需求
2. 然后，为您设计科学的联络体系和流程
3. 接着，提供完整的联络表模板和管理方案
4. 最后，指导您进行演练测试和持续优化

现在，请告诉我：
- 您的组织类型和规模是什么？
- 您需要应对哪些类型的紧急情况？
- 您现有的应急联络机制存在什么问题？

让我们开始吧！`;

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { prompt, conversationHistory = [] } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供内容' },
        { status: 400 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API密钥未配置' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000);

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.8,
        max_tokens: 4000,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error?.message || '生成失败' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    function cleanMarkdown(text: string): string {
      return text
        .replace(/```markdown\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
    }

    const cleanedText = cleanMarkdown(generatedText);

    return NextResponse.json({
      content: cleanedText,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: prompt },
        { role: 'assistant', content: cleanedText }
      ]
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: '请求超时，请重试' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { error: error.message || '生成失败' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: '生成失败' },
      { status: 500 }
    );
  }
}
