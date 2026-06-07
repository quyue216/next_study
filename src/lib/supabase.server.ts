import { createClient } from "@supabase/supabase-js"

// 服务端用的 Supabase 客户端（带 service role）
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 创建 Supabase 服务端实例（用于 Server Actions/Server Components）
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
