import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getTransactionHistory } from '@/lib/credits';

/**
 * GET /api/user/transactions
 * 获取当前用户的积分消费记录
 */
export async function GET(request: NextRequest) {
  try {
    // 创建Supabase服务端客户端
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '未授权访问', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') as any;

    // 获取交易记录
    const transactions = await getTransactionHistory(user.id, {
      limit,
      offset,
      type,
    });

    // 返回交易记录
    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total: transactions.length,
      },
    });
  } catch (error) {
    console.error('获取交易记录API错误:', error);

    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
