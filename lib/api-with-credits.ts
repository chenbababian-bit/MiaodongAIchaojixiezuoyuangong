/**
 * 带积分扣费的API生成封装
 * 为288个API路由提供统一的积分扣费逻辑
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getUserCredits,
  countWords,
  calculateCredits,
  getPricingRule,
  deductCredits,
  type UsageInfo,
} from './credits';
import { getTemplateById } from './template-config';

// ============================================
// 类型定义
// ============================================

export interface GenerateOptions {
  templateId: number;
  generateFn: () => Promise<{ result: string; usage?: UsageInfo }>;
}

export interface CreditsInfo {
  used: number;
  remaining: number;
  wordCount: number;
}

export interface GenerateResponse {
  success: boolean;
  result?: string;
  usage?: UsageInfo;
  credits?: CreditsInfo;
  error?: string;
  code?: string;
}

// ============================================
// 错误码定义
// ============================================

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  GENERATION_FAILED: 'GENERATION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================
// 核心函数
// ============================================

/**
 * 创建服务端Supabase客户端
 */
async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

/**
 * 带积分扣费的AI生成封装
 *
 * 使用方式:
 * ```typescript
 * import { generateWithCredits } from "@/lib/api-with-credits";
 *
 * export async function POST(request: NextRequest) {
 *   const body = await request.json();
 *   const { content, conversationHistory } = body;
 *
 *   return await generateWithCredits(request, {
 *     templateId: 102,
 *     generateFn: async () => {
 *       // 调用DeepSeek API
 *       const response = await callDeepSeekAPI(content, conversationHistory);
 *       return { result: response.result, usage: response.usage };
 *     }
 *   });
 * }
 * ```
 */
export async function generateWithCredits(
  request: NextRequest,
  options: GenerateOptions
): Promise<NextResponse<GenerateResponse>> {
  const { templateId, generateFn } = options;

  try {
    // 1. 获取用户身份
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: '请先登录后再使用',
          code: ERROR_CODES.UNAUTHORIZED,
        },
        { status: 401 }
      );
    }

    // 2. 获取用户积分（如果是新用户会自动初始化）
    const credits = await getUserCredits(user.id);
    if (!credits || credits.balance <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: '积分不足，请充值后继续使用',
          code: ERROR_CODES.INSUFFICIENT_CREDITS,
        },
        { status: 402 }
      );
    }

    // 3. 调用AI生成
    let generateResult: { result: string; usage?: UsageInfo };
    try {
      generateResult = await generateFn();
    } catch (genError) {
      console.error('AI生成失败:', genError);
      return NextResponse.json(
        {
          success: false,
          error: 'AI生成失败，请重试',
          code: ERROR_CODES.GENERATION_FAILED,
        },
        { status: 500 }
      );
    }

    if (!generateResult.result) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI返回结果为空，请重试',
          code: ERROR_CODES.GENERATION_FAILED,
        },
        { status: 500 }
      );
    }

    // 4. 计算字数和积分
    const wordCount = countWords(generateResult.result);
    const pricingRule = getPricingRule(templateId);
    const creditsToDeduct = calculateCredits(wordCount, pricingRule);

    // 5. 检查积分是否足够
    if (credits.balance < creditsToDeduct) {
      return NextResponse.json(
        {
          success: false,
          error: `积分不足，本次生成需要${creditsToDeduct}积分，当前余额${credits.balance}积分`,
          code: ERROR_CODES.INSUFFICIENT_CREDITS,
        },
        { status: 402 }
      );
    }

    // 6. 扣除积分
    const template = getTemplateById(templateId);
    const deductResult = await deductCredits(user.id, creditsToDeduct, {
      templateId,
      templateName: template?.title,
      wordCount,
      usage: generateResult.usage,
      description: `${template?.title || 'AI生成'}消费`,
    });

    if (!deductResult.success) {
      // 扣费失败但内容已生成，记录日志但仍返回内容
      console.error('积分扣除失败，但内容已生成:', deductResult.error);
    }

    // 7. 返回结果
    return NextResponse.json({
      success: true,
      result: generateResult.result,
      usage: generateResult.usage,
      credits: {
        used: deductResult.creditsDeducted,
        remaining: deductResult.remainingBalance,
        wordCount,
      },
    });
  } catch (error) {
    console.error('generateWithCredits Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误，请稍后重试',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    );
  }
}

/**
 * 预估积分消费（用于前端显示）
 */
export function estimateCredits(
  estimatedWordCount: number,
  templateId?: number
): number {
  const rule = getPricingRule(templateId);
  return calculateCredits(estimatedWordCount, rule);
}

/**
 * 仅检查用户积分（不扣费）
 * 用于前端在调用前预检查
 */
export async function checkUserCredits(
  request: NextRequest
): Promise<NextResponse<{ balance: number; sufficient: boolean } | { error: string; code: string }>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录', code: ERROR_CODES.UNAUTHORIZED },
        { status: 401 }
      );
    }

    const credits = await getUserCredits(user.id);
    const balance = credits?.balance || 0;

    return NextResponse.json({
      balance,
      sufficient: balance > 0,
    });
  } catch (error) {
    console.error('checkUserCredits Error:', error);
    return NextResponse.json(
      { error: '获取积分失败', code: ERROR_CODES.INTERNAL_ERROR },
      { status: 500 }
    );
  }
}
