import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * PUT /api/user/profile
 * 更新用户基本信息
 */
export async function PUT(request: NextRequest) {
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

    // 解析请求体
    const body = await request.json();
    const { fullName } = body;

    if (!fullName || fullName.trim() === '') {
      return NextResponse.json(
        { error: '姓名不能为空', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    // 更新用户元数据
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
      },
    });

    if (error) {
      console.error('更新用户信息失败:', error);
      return NextResponse.json(
        { error: '更新失败，请稍后重试', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        fullName: data.user?.user_metadata?.full_name,
        email: data.user?.email,
      },
    });
  } catch (error) {
    console.error('更新用户信息API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
