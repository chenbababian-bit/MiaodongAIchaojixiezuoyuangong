import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 清空指定模板的历史记录
 * POST /api/history/clear
 */

// 验证用户登录状态
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return { user: null, error: '未登录' }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: '认证失败' }
  }

  return { user, error: null }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || '未登录' },
        { status: 401 }
      )
    }

    // 解析请求体
    const body = await request.json()
    const { templateId } = body

    if (!templateId) {
      return NextResponse.json(
        { error: '缺少templateId参数' },
        { status: 400 }
      )
    }

    // 删除指定模板的所有历史记录（RLS会自动确保只能删除自己的记录）
    const { error } = await supabase
      .from('writing_history')
      .delete()
      .eq('user_id', user.id)
      .eq('template_id', templateId)

    if (error) {
      console.error('清空历史记录失败:', error)
      return NextResponse.json(
        { error: '清空历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('清空历史记录异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
