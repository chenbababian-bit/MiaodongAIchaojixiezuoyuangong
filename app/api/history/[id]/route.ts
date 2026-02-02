import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 历史记录单条操作API
 * DELETE /api/history/[id] - 删除单条历史记录
 * PATCH /api/history/[id] - 更新单条历史记录
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

// PATCH - 更新历史记录
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Next.js 15: params 是 Promise，需要 await
    const { id } = await params

    // 解析请求体
    const body = await request.json()
    const { content, result, conversations } = body

    // 构建更新数据
    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (result !== undefined) updateData.result = result
    if (conversations !== undefined) updateData.conversations = conversations

    // 更新历史记录（RLS会自动确保只能更新自己的记录）
    const { data, error } = await supabase
      .from('writing_history')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('更新历史记录失败:', error)
      return NextResponse.json(
        { error: '更新历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('更新历史记录异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// DELETE - 删除历史记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Next.js 15: params 是 Promise，需要 await
    const { id } = await params

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
