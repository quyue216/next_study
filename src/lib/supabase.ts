import { createClient } from "@supabase/supabase-js"

// Supabase 项目 URL，从环境变量读取
const supabaseUrl = process.env.SUPABASE_URL!
// Supabase 服务角色密钥，拥有最高权限，仅限服务端使用
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 创建 Supabase 服务端客户端实例
// persistSession: false 表示不持久化会话，适合服务端/无状态场景使用
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})
