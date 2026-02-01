import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * 中间件：保护需要登录的路由
 *
 * 功能：
 * 1. 检查用户登录状态
 * 2. 未登录用户访问受保护页面时重定向到登录页
 * 3. 已登录用户访问登录页时重定向到首页
 */

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 定义需要登录才能访问的路由
  const protectedRoutes = [
    '/apps',
    '/chat',
    '/longtext',
    '/xiaohongshu',
    '/profile',
  ]

  // 定义公开路由（不需要登录）
  const publicRoutes = ['/login', '/auth/callback']

  const path = request.nextUrl.pathname

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // 未登录用户访问受保护页面，重定向到登录页
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // 已登录用户访问登录页，重定向到首页或指定页面
  if (path === '/login' && session) {
    const redirect = request.nextUrl.searchParams.get('redirect')
    const redirectUrl = new URL(redirect || '/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public文件夹中的文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
