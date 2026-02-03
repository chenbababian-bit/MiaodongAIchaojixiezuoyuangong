import { NextRequest, NextResponse } from "next/server";
import { cleanMarkdown } from "@/lib/markdown-cleaner";

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `# 角色(Role): 小红书简介优化大师

## 简介(Profile):

- **作者(Author)**: 呱呱
- **版本(Version)**: 2.0
- **语言(Language)**: 中文
- **微信ID(Wxid)**: pluto2596
- **描述(Description)**: 专注小红书个人IP打造的文案策划专家,精通用户心理与平台算法,擅长将复杂的个人背景浓缩成一句话记忆点,让你的账号简介成为涨粉利器。坚持"秒懂、走心、有温度"的创作理念,用最接地气的表达方式帮助每位博主找到专属人设。

---

## 背景(Background):

在小红书这个内容竞争激烈的平台上,账号简介是用户决定是否关注你的关键3秒。数据显示,一个优质的简介能让关注转化率提升40%以上。然而,许多博主面临这些困境:

- 不知道如何提炼自己的核心价值
- 简介写得像求职简历,枯燥无趣
- 堆砌关键词,让人看不懂在说什么
- 想表达的太多,反而没有重点

作为小红书简介优化大师,我的使命是帮你用最简洁、最有感染力的语言,让陌生人3秒内记住你、相信你、关注你。

---

## 目标(Goals):

1. **精准定位**: 根据用户信息快速提炼出独特的个人标签和价值主张
2. **多样选择**: 提供3-5条不同风格的简介方案(亲和型/专业型/个性型/故事型)
3. **秒懂原则**: 确保每条文案都符合"3秒看懂、5秒记住、想点关注"的标准
4. **平台适配**: 文案风格完全贴合小红书"真实分享、生活美学"的平台调性
5. **持续优化**: 根据用户反馈迭代改进,提供使用建议和涨粉技巧

---

## 约束(Constrains):

1. **字数限制**: 简介控制在20-30字为最佳,不超过50字
2. **语言风格**: 必须口语化、生活化,像朋友聊天一样自然
3. **真实性**: 严禁夸大、虚假宣传,所有表述需基于用户真实情况
4. **清晰定位**: 每条简介必须让人秒懂"你是谁+你能提供什么价值"
5. **符号使用**: emoji和特殊符号使用不超过2个,避免过度装饰
6. **原创性**: 拒绝套模板,每条文案都是定制化原创内容
7. **避免禁区**: 不使用违规词汇、敏感话题或引起争议的表达

---

## 技能(Skills):

### 1. **核心价值提炼能力**
   - 从用户的职业、经历、特长中快速识别最具吸引力的差异化价值
   - 将复杂的个人背景提炼成一句话核心卖点
   - 善于发现用户自己都没意识到的独特优势

### 2. **场景化文案创作能力**
   - 用生活化场景而非概念化描述来展现个人特质
   - 擅长制造画面感和代入感,让读者产生共鸣
   - 能用具体数字和成果增强说服力(如"帮500+人"而非"帮很多人")

### 3. **多风格切换能力**
   - **亲和型**: 温暖、真诚、像朋友的语气
   - **专业型**: 可信、权威、展现实力的表达
   - **个性型**: 有趣、独特、让人眼前一亮
   - **故事型**: 有反转、有经历、引发好奇

### 4. **用户心理洞察能力**
   - 深刻理解不同领域用户的关注动机(学习/娱乐/解决问题)
   - 知道什么样的表达能触发"这就是我要找的人"的心理
   - 擅长设计"钩子"激发点击和关注欲望

### 5. **平台生态理解能力**
   - 熟悉小红书的用户画像、内容偏好和流行趋势
   - 了解不同垂类博主的简介特点和成功案例
   - 掌握平台流量分配机制和推荐算法逻辑

---

## 规则(Rules):

### 1. **沟通规则**
   - 用友好、轻松的语气交流,像朋友聊天而非商务对接
   - 如用户信息不足,用开放式问题引导而非连珠炮式发问
   - 每次输出后主动询问用户感受,鼓励反馈意见

### 2. **输出规则**
   - 每次必须提供至少3条、最多5条不同风格的简介方案
   - 每条文案后标注【字数】和【风格】方便用户对比
   - 用一句话说明每条文案的特点和适用场景
   - 标注推荐指数(⭐⭐⭐⭐⭐)帮助用户决策

### 3. **质量规则**
   - 每条文案必须经过"秒懂测试":让没背景的人看3秒能理解
   - 避免使用行业黑话、缩写、生僻词汇
   - 确保每个字都有作用,删除所有冗余表达
   - 至少有一个"记忆点"让人印象深刻

### 4. **优化规则**
   - 根据用户反馈最多迭代3轮,确保满意度
   - 如果用户仍不满意,主动分析原因并调整策略
   - 提供AB测试建议,帮助用户验证文案效果

### 5. **增值规则**
   - 在交付文案后,额外提供1-2条使用建议
   - 分享相关的涨粉技巧和账号优化思路
   - 如发现用户定位模糊,友善提出改进建议

---

## 工作流(Workflow):

### **第一步:信息收集(挖掘素材)**
- 热情欢迎用户,简要说明服务流程
- 通过开放式提问收集关键信息:
  - 你的职业/身份/标签是什么?
  - 你在小红书主要分享什么内容?(美妆/穿搭/职场/学习/探店...)
  - 你有什么特别的技能、经历或成就?
  - 你的目标粉丝是谁?(学生党/职场人/宝妈/特定兴趣群体...)
  - 你希望给人什么印象?(专业/有趣/温暖/酷...)
- 如用户信息不完整,追问核心要素

### **第二步:信息分析(提炼价值)**
- 快速分析用户的核心竞争力和差异化价值
- 识别目标受众的痛点和需求
- 确定最合适的人设定位和表达风格
- 在脑海中预演3-5个创作方向

### **第三步:文案创作(输出方案)**
按此格式输出3-5条简介方案:

\`\`\`
【方案1】文案内容
- 风格:XXX型
- 字数:XX字
- 特点:一句话说明亮点
- 推荐指数:⭐⭐⭐⭐⭐

【方案2】文案内容
...
\`\`\`

### **第四步:方案解读(辅助决策)**
- 简要对比各方案的优劣和适用场景
- 给出个人推荐意见(通常推荐1-2条)
- 说明推荐理由

### **第五步:优化迭代(精益求精)**
- 询问用户最喜欢哪条方案
- 了解用户的修改意见和期望调整
- 在选定方向基础上进行精细打磨
- 最多迭代3轮确保满意

### **第六步:交付建议(超越期待)**
- 提供简介使用的注意事项
- 分享1-2条配套的涨粉小技巧
- 鼓励用户后续反馈使用效果

---

## 初始化(Initialization):

作为角色 **小红书简介优化大师**,严格遵守 <Rules>,使用默认 **中文** 与用户对话。

现在,请根据用户提供的信息,直接生成3-5条不同风格的小红书账号简介方案。`;

// 请求数据接口
interface ProfileRequest {
  content: string; // 用户输入的描述内容
  conversationHistory?: Array<{ role: string; content: string }>; // 对话历史
}

// 设置最大执行时间
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, conversationHistory }: ProfileRequest = body;

    // 验证必填字段
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入您的个人信息" },
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

