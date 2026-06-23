# 登录注册开发知识点

## 一、Next.js 16 App Router 核心概念

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **Server Component (RSC)** | `page.tsx` 里直接读 cookie、查数据库 | `React Server Components`, `"use client" 边界` |
| **Server Actions** | `loginAction` / `registerAction` / `logoutAction` | `"use server"`, `useActionState`, `form action` |
| **Proxy（Next.js 16 替代 Middleware）** | `src/proxy.ts` 做路由保护 | `Next.js 16 Proxy`, `NextResponse`, `matcher` |
| **路由与重定向** | 未登录 → `/login`，已登录访问 `/login` → `/todos` | `redirect() from next/navigation` |

### 为什么用 Proxy 而不是 middleware.ts？

Next.js 16 把中间件机制改成了 `proxy.ts`（注意不是旧版 `middleware.ts`），它本质上还是一个请求拦截器，但 API 和生命周期有变化。当前项目版本是 16.2.6，所以用 `src/proxy.ts`。

---

## 二、React 19 表单相关

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **useActionState** | 早期方案里 Server Action 的状态管理 | `useActionState React 19` |
| **useForm / react-hook-form** | 最终采用的客户端表单管理 | `react-hook-form`, `register`, `handleSubmit` |
| **受控与非受控** | `Input {...register("email")}` 是半受控模式 | `controlled vs uncontrolled inputs` |

---

## 三、Supabase Auth + @supabase/ssr

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **@supabase/ssr** | 统一浏览器/服务端/middleware 的 cookie 会话 | `@supabase/ssr createBrowserClient createServerClient` |
| **cookie 同步机制** | `proxy.ts` / `supabase.server.ts` 里的 `cookies.getAll/setAll` | `Supabase cookie auth flow`, `sb-access-token` |
| **session 刷新** | `setAll` 在 token 过期自动刷新时触发 | `refresh token`, `onAuthStateChange` |
| **auth.users 表** | Supabase 自动维护，不要手动建 | `Supabase auth schema`, `GoTrue` |
| **service role key** | `seed-admin.mjs` 和查询用户列表时用 | `SUPABASE_SERVICE_ROLE_KEY`, `supabase admin API` |

### 为什么分 browser/server 两个 client？

- **浏览器端**：`createBrowserClient`，能操作 `localStorage` / cookie
- **服务端**：`createServerClient`，从 `next/headers` 读取 `cookies()`
- **service role client**：只用于管理操作，**绝对不能暴露给浏览器**

---

## 四、数据库安全：RLS（Row Level Security）

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **RLS 策略** | `todos` 表按 `user_id` 隔离 | `PostgreSQL RLS`, `auth.uid() = user_id` |
| **user_id 外键** | `todos.user_id REFERENCES auth.users(id)` | `Supabase foreign key to auth.users` |
| **匿名数据迁移** | 旧 `user_id IS NULL` 数据关联到 admin 账户 | `data migration`, `service role update` |

### 关键理解

即使 API 被拿到 access token，RLS 也会阻止用户 A 访问用户 B 的数据。这是本次"数据隔离"的核心。

---

## 五、表单校验：zod

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **zod schema** | `authSchema` 定义邮箱/密码规则 | `zod string email min` |
| **refine 交叉字段校验** | 注册时"确认密码"必须一致 | `zod refine`, `zod superRefine` |
| **safeParse** | Server Action 里做服务端校验 | `z.safeParse`, `ZodError.flatten` |
| **@hookform/resolvers** | 把 zod schema 接到 react-hook-form | `zodResolver` |

---

## 六、UI 与样式

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **shadcn/ui** | `Card`, `Input`, `Button`, `Tabs`, `Label` | `shadcn/ui components` |
| **Tailwind 间距系统** | `max-w-93` 替代 `max-w-[372px]` | `Tailwind spacing scale`, `1 = 0.25rem = 4px` |
| **canonic classes** | IDE 提示用标准类名而非任意值 | `Tailwind arbitrary values vs defaults` |

---

## 七、状态管理：Zustand

| 知识点 | 本次应用 | 学习关键词 |
|--------|---------|-----------|
| **轻量全局状态** | `auth-store.ts` 存当前 user | `zustand`, `create store` |
| **与 Supabase 订阅联动** | `AuthProvider` 监听 `onAuthStateChange` | `zustand + supabase auth` |

### 注意

本次修复用户名显示时，最终没用 zustand，而是选择服务端传 prop。这说明全局状态不是万能的，首屏数据优先从服务端拿。

---

## 八、安全与规范

| 知识点 | 本次处理 | 学习关键词 |
|--------|---------|-----------|
| **service role 不暴露** | 只放在 `.env.local` 服务端用 | `environment variables security` |
| **anon key 安全边界** | 浏览器端用 `NEXT_PUBLIC_` 前缀 | `Supabase anon key vs service role` |
| **密码不存储在业务表** | 完全交给 Supabase Auth | `Supabase password hashing` |
| **邮箱验证** | 注册后发送确认邮件 | `Supabase email confirmation` |

---

## 九、推荐学习顺序

### 1. 先看官方文档扫目录（10%）

- Next.js 16 docs: `Routing`, `Server Actions`, `Authentication`
- Supabase Auth docs: `Email Auth`, `Row Level Security`, `@supabase/ssr`

### 2. 对照本次代码复盘（10%）

- 为什么 `proxy.ts` 要 `setAll` 两次？
- 为什么 `TodoHeader` 最后改成服务端传 prop？
- 为什么 `auth.admin.listUsers()` 必须用 service role？

### 3. 动手改一个小功能（80%）

- 给注册加"昵称"字段
- 登录失败后显示更友好的错误
- 未验证邮箱的用户禁止登录

---

## 十、本次踩坑清单

1. `column todos.user_id does not exist` → schema 没同步 / RLS 没改
2. `not_admin` 错误 → anon client 调了 admin API
3. `refresh_token_not_found` → cookie 没正确同步或 env 配置问题
4. 用户名不显示 → 客户端状态同步不及时，改服务端传 prop 解决

---

## 十一、核心文件速查

| 文件 | 职责 |
|------|------|
| `src/proxy.ts` | 路由保护、会话刷新 |
| `src/app/auth/actions.ts` | 登录/注册/退出 Server Actions |
| `src/app/login/page.tsx` | 登录页入口 |
| `src/app/login/_components/auth-form.tsx` | 登录/注册表单 UI |
| `src/lib/supabase.ts` | 浏览器端 Supabase 客户端 |
| `src/lib/supabase.server.ts` | 服务端 + service role 客户端 |
| `src/components/providers/auth-provider.tsx` | 全局 auth 状态监听 |
| `src/stores/auth-store.ts` | Zustand 用户状态 |
| `src/app/todos/page.tsx` | 服务端取用户和 todos |
| `src/app/todos/_components/todo-header.tsx` | 显示邮箱和退出按钮 |
| `supabase/schema.sql` | 表结构 + RLS 策略 |
| `scripts/seed-admin.mjs` | 创建 admin 默认账户 |
