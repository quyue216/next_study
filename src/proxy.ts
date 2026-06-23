import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 Proxy: 路由保护与会话管理中间件
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 创建 Supabase 服务端客户端，同步 cookie
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        /* 
          任何时候 session 变了（登录、刷新、登出、手动改），setAll 都会执行，用来同步更新浏览器保存的cookie。
        
        */
        setAll(cookiesToSet) {
              // 第一次：把新 token 写到当前这张"小纸条"上
          cookiesToSet.forEach(({ name, value }) => {
            // request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
           //第二次：让浏览器把新 tok n 保存下来，下次访问还能用
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 获取当前登录用户
  const { data } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // 未登录用户访问非登录页 → 重定向到登录页
  if (!data.user && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 已登录用户访问登录页 → 重定向到 todos 页
  if (data.user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/todos";
    return NextResponse.redirect(url);
  }

  return response;
}

// 匹配所有路由，排除 Next.js 内部路径与静态资源
export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|json)$).*)",
  ],
};
