'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取 URL 中的哈希参数
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // 设置会话
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('Auth callback error:', error)
            toast.error('登录失败', {
              description: error.message,
            })
            router.push('/login')
            return
          }

          if (data.user) {
            toast.success('登录成功', {
              description: `欢迎回来，${data.user.email}`,
            })
            router.push('/')
          }
        } else {
          // 如果没有 token，尝试从 URL 参数中获取错误信息
          const error = hashParams.get('error')
          const errorDescription = hashParams.get('error_description')

          if (error) {
            toast.error('登录失败', {
              description: errorDescription || error,
            })
          }

          router.push('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('登录失败', {
          description: '发生未知错误，请稍后重试',
        })
        router.push('/login')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-lg">正在处理登录...</p>
      </div>
    </div>
  )
}
