import { createClient } from "@supabase/supabase-js"

// Supabase 项目 URL，从环境变量读取（必须在客户端环境中暴露）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
console.log("🚀 ~ supabaseUrl:", supabaseUrl)
// Supabase 匿名密钥，适合客户端使用
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建 Supabase 客户端实例（用于浏览器/客户端组件）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
