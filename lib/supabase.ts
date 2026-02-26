import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 使用 createBrowserClient 确保 session 存入 cookies，服务端 API 路由可读取
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
