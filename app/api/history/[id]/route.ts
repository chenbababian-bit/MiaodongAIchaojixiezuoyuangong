import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 删除单条历史记录
 * DELETE /api/history/[id]
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证用户登录
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || '未登录' },
        { status: 401 }
      )
    }

    const id = params.id

    // 删除历史记录（RLS会自动确保只能删除自己的记录）
    const { error } = await supabase
      .from('writing_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除历史记录失败:', error)
      return NextResponse.json(
        { error: '删除历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除历史记录异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
