import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * 历史记录API路由
 *
 * GET /api/history - 获取历史记录
 *   - 查询参数：templateId (可选) - 筛选特定模板的历史记录
 * POST /api/history - 添加历史记录
 * DELETE /api/history/[id] - 删除历史记录
 * POST /api/history/clear - 清空指定模板的历史记录
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

// GET - 获取历史记录
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const { user, error: authError } = await getAuthenticatedUser(request)
    if (authError || !user) {
      return NextResponse.json(
        { error: authError || '未登录' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')

    // 构建查询
    let query = supabase
      .from('writing_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // 如果指定了模板ID，则筛选
    if (templateId) {
      query = query.eq('template_id', templateId)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取历史记录失败:', error)
      return NextResponse.json(
        { error: '获取历史记录失败' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('获取历史记录异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

// POST - 添加历史记录
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
    const { templateId, templateTitle, content, result } = body

    // 验证必填字段
    if (!templateId || !templateTitle || !content || !result) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 插入历史记录
    const { data, error } = await supabase
      .from('writing_history')
      .insert({
        user_id: user.id,
        template_id: templateId,
        template_title: templateTitle,
        content,
        result,
      })
      .select()
      .single()

    if (error) {
      console.error('添加历史记录失败:', error)
      return NextResponse.json(
        { error: '添加历史记录失败' },
        { status: 500 }
      )
    }

    // 限制每个用户每个模板最多保存50条历史记录
    // 查询该用户该模板的历史记录数量
    const { count } = await supabase
      .from('writing_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('template_id', templateId)

    if (count && count > 50) {
      // 删除最旧的记录
      const { data: oldestRecords } = await supabase
        .from('writing_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('template_id', templateId)
        .order('created_at', { ascending: true })
        .limit(count - 50)

      if (oldestRecords && oldestRecords.length > 0) {
        const idsToDelete = oldestRecords.map(r => r.id)
        await supabase
          .from('writing_history')
          .delete()
          .in('id', idsToDelete)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('添加历史记录异常:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
