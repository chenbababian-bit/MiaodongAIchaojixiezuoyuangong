/**
 * 用户积分系统核心库
 * 提供积分查询、扣费、记录等功能
 */

import { createClient } from '@supabase/supabase-js';
import { getTemplateById, type TemplateCategory } from './template-config';

// 创建服务端 Supabase 客户端（使用 Service Role Key 绕过 RLS）
// 注意：仅在服务端 API 路由中使用，不要在客户端使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 服务端客户端，用于积分操作（绕过 RLS 策略）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================
// 类型定义
// ============================================

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_consumed: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'consumption' | 'recharge' | 'gift' | 'refund' | 'adjustment';
  amount: number;
  balance_before: number;
  balance_after: number;
  template_id?: number;
  template_name?: string;
  word_count?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface PricingRule {
  creditsPerHundredChars: number;
  minCredits: number;
  maxCredits?: number;
}

export interface DeductionResult {
  success: boolean;
  creditsDeducted: number;
  remainingBalance: number;
  transactionId?: string;
  error?: string;
}

export interface UsageInfo {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

// ============================================
// 常量配置
// ============================================

// 新用户默认积分
export const DEFAULT_NEW_USER_CREDITS = 10;

// 计费规则说明：
// - 1 元 = 10 积分
// - 每千字 0.5 积分（即每 2000 字消耗 1 积分）
// - 最低消费 1 积分（不满 2000 字也算 1 积分）

// 默认定价规则（统一定价）
// 计费规则：每千字 0.5 积分，精确到3位小数
// minCredits 设为 0.001，表示最少消费 0.001 积分
const DEFAULT_PRICING: Record<string, PricingRule> = {
  default: { creditsPerHundredChars: 1, minCredits: 0.001 },
  xiaohongshu: { creditsPerHundredChars: 1, minCredits: 0.001 },
  wechat: { creditsPerHundredChars: 1, minCredits: 0.001 },
  toutiao: { creditsPerHundredChars: 1, minCredits: 0.001 },
  weibo: { creditsPerHundredChars: 1, minCredits: 0.001 },
  zhihu: { creditsPerHundredChars: 1, minCredits: 0.001 },
  video: { creditsPerHundredChars: 1, minCredits: 0.001 },
  live: { creditsPerHundredChars: 1, minCredits: 0.001 },
  private: { creditsPerHundredChars: 1, minCredits: 0.001 },
  report: { creditsPerHundredChars: 1, minCredits: 0.001 },
  'brand-strategy': { creditsPerHundredChars: 1, minCredits: 0.001 },
  'creative-strategy': { creditsPerHundredChars: 1, minCredits: 0.001 },
  'data-analysis': { creditsPerHundredChars: 1, minCredits: 0.001 },
  business: { creditsPerHundredChars: 1, minCredits: 0.001 },
  general: { creditsPerHundredChars: 1, minCredits: 0.001 },
};

// ============================================
// 核心函数
// ============================================

/**
 * 获取用户积分余额
 * 如果用户没有积分记录，会自动初始化
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // 如果是"没有找到记录"错误，为新用户创建积分账户
      if (error.code === 'PGRST116') {
        return await initializeUserCredits(userId);
      }
      console.error('获取用户积分失败:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('获取用户积分异常:', error);
    return null;
  }
}

/**
 * 初始化新用户积分账户
 */
export async function initializeUserCredits(userId: string): Promise<UserCredits | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_credits')
      .insert({
        user_id: userId,
        balance: DEFAULT_NEW_USER_CREDITS,
        total_earned: DEFAULT_NEW_USER_CREDITS,
        total_consumed: 0,
      })
      .select()
      .single();

    if (error) {
      // 如果是唯一约束冲突，说明记录已存在，重新获取
      if (error.code === '23505') {
        return await getUserCreditsDirectly(userId);
      }
      console.error('初始化用户积分失败:', error);
      return null;
    }

    // 记录赠送交易
    await recordTransaction(userId, {
      transaction_type: 'gift',
      amount: DEFAULT_NEW_USER_CREDITS,
      balance_before: 0,
      balance_after: DEFAULT_NEW_USER_CREDITS,
      description: '新用户注册赠送积分',
    });

    return data;
  } catch (error) {
    console.error('初始化用户积分异常:', error);
    return null;
  }
}

/**
 * 直接获取用户积分（不触发初始化）
 */
async function getUserCreditsDirectly(userId: string): Promise<UserCredits | null> {
  const { data, error } = await supabaseAdmin
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('直接获取用户积分失败:', error);
    return null;
  }

  return data;
}

/**
 * 检查用户积分是否足够
 */
export async function checkCreditsBalance(
  userId: string,
  estimatedCredits: number
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  const credits = await getUserCredits(userId);
  const balance = credits?.balance || 0;

  return {
    sufficient: balance >= estimatedCredits,
    balance,
    required: estimatedCredits,
  };
}

/**
 * 统计文本字数（中文+英文字符）
 */
export function countWords(text: string): number {
  if (!text) return 0;

  // 移除空白字符后计算长度
  const cleanText = text.replace(/\s+/g, '');
  return cleanText.length;
}

/**
 * 根据模板获取定价规则
 */
export function getPricingRule(templateId?: number): PricingRule {
  if (!templateId) {
    return DEFAULT_PRICING.default;
  }

  const template = getTemplateById(templateId);
  if (!template) {
    return DEFAULT_PRICING.default;
  }

  // 根据模板分类获取定价
  const category = template.category as string;
  return DEFAULT_PRICING[category] || DEFAULT_PRICING.default;
}

/**
 * 根据分类获取定价规则
 */
export function getPricingRuleByCategory(category: TemplateCategory | string): PricingRule {
  return DEFAULT_PRICING[category] || DEFAULT_PRICING.default;
}

/**
 * 计算消费积分
 *
 * 计费规则：
 * - 每千字 0.5 积分，精确到3位小数
 * - 1 元 = 10 积分
 *
 * 计费示例：
 * - 100 字 → 0.05 积分
 * - 500 字 → 0.25 积分
 * - 1000 字 → 0.5 积分
 * - 1328 字 → 0.664 积分
 * - 2000 字 → 1 积分
 * - 5000 字 → 2.5 积分
 */
export function calculateCredits(wordCount: number, rule: PricingRule): number {
  if (wordCount <= 0) return 0;

  // 每千字 0.5 积分，精确到3位小数
  const rawCredits = (wordCount / 1000) * 0.5;
  const baseCredits = Math.round(rawCredits * 1000) / 1000;

  // 应用最低消费限制
  let finalCredits = Math.max(baseCredits, rule.minCredits);

  // 应用最高消费限制（如果有）
  if (rule.maxCredits) {
    finalCredits = Math.min(finalCredits, rule.maxCredits);
  }

  // 保留3位小数
  return Math.round(finalCredits * 1000) / 1000;
}

/**
 * 扣除用户积分
 */
export async function deductCredits(
  userId: string,
  amount: number,
  metadata: {
    templateId?: number;
    templateName?: string;
    wordCount?: number;
    usage?: UsageInfo;
    description?: string;
  }
): Promise<DeductionResult> {
  try {
    // 1. 获取当前余额
    const credits = await getUserCredits(userId);
    if (!credits) {
      return {
        success: false,
        creditsDeducted: 0,
        remainingBalance: 0,
        error: '无法获取用户积分信息',
      };
    }

    // 2. 检查余额是否足够
    if (credits.balance < amount) {
      return {
        success: false,
        creditsDeducted: 0,
        remainingBalance: credits.balance,
        error: `积分不足，当前余额${credits.balance}，需要${amount}积分`,
      };
    }

    const balanceBefore = credits.balance;
    const balanceAfter = balanceBefore - amount;

    // 3. 更新余额
    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        balance: balanceAfter,
        total_consumed: credits.total_consumed + amount,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('更新用户积分失败:', updateError);
      return {
        success: false,
        creditsDeducted: 0,
        remainingBalance: balanceBefore,
        error: '扣除积分失败，请重试',
      };
    }

    // 4. 记录交易
    const transaction = await recordTransaction(userId, {
      transaction_type: 'consumption',
      amount: -amount, // 消费为负数
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      template_id: metadata.templateId,
      template_name: metadata.templateName,
      word_count: metadata.wordCount,
      prompt_tokens: metadata.usage?.prompt_tokens,
      completion_tokens: metadata.usage?.completion_tokens,
      total_tokens: metadata.usage?.total_tokens,
      description: metadata.description || 'AI生成文本消费',
    });

    return {
      success: true,
      creditsDeducted: amount,
      remainingBalance: balanceAfter,
      transactionId: transaction?.id,
    };
  } catch (error) {
    console.error('扣除积分异常:', error);
    return {
      success: false,
      creditsDeducted: 0,
      remainingBalance: 0,
      error: '系统错误，请稍后重试',
    };
  }
}

/**
 * 记录交易
 */
async function recordTransaction(
  userId: string,
  data: Omit<CreditTransaction, 'id' | 'user_id' | 'created_at'>
): Promise<CreditTransaction | null> {
  try {
    const { data: transaction, error } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single();

    if (error) {
      console.error('记录交易失败:', error);
      return null;
    }

    return transaction;
  } catch (error) {
    console.error('记录交易异常:', error);
    return null;
  }
}

/**
 * 获取用户交易记录
 */
export async function getTransactionHistory(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: CreditTransaction['transaction_type'];
  }
): Promise<CreditTransaction[]> {
  try {
    let query = supabaseAdmin
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.type) {
      query = query.eq('transaction_type', options.type);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取交易记录失败:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('获取交易记录异常:', error);
    return [];
  }
}

/**
 * 充值积分（预留扩展）
 */
export async function rechargeCredits(
  userId: string,
  amount: number,
  description?: string
): Promise<boolean> {
  try {
    const credits = await getUserCredits(userId);
    if (!credits) return false;

    const balanceBefore = credits.balance;
    const balanceAfter = balanceBefore + amount;

    const { error } = await supabaseAdmin
      .from('user_credits')
      .update({
        balance: balanceAfter,
        total_earned: credits.total_earned + amount,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('充值积分失败:', error);
      return false;
    }

    await recordTransaction(userId, {
      transaction_type: 'recharge',
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: description || '积分充值',
    });

    return true;
  } catch (error) {
    console.error('充值积分异常:', error);
    return false;
  }
}

/**
 * 赠送积分（用于活动、补偿等）
 */
export async function giftCredits(
  userId: string,
  amount: number,
  description?: string
): Promise<boolean> {
  try {
    const credits = await getUserCredits(userId);
    if (!credits) return false;

    const balanceBefore = credits.balance;
    const balanceAfter = balanceBefore + amount;

    const { error } = await supabaseAdmin
      .from('user_credits')
      .update({
        balance: balanceAfter,
        total_earned: credits.total_earned + amount,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('赠送积分失败:', error);
      return false;
    }

    await recordTransaction(userId, {
      transaction_type: 'gift',
      amount: amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: description || '积分赠送',
    });

    return true;
  } catch (error) {
    console.error('赠送积分异常:', error);
    return false;
  }
}
