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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
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

// 匹配所有路由，排除静态资源
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
