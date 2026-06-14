# 缓存 (Cache) 知识图谱

## 1. 是什么
* **本质**：用空间换时间，减少重复计算与网络 I/O，提升响应速度。
* **分类 (按层级)**
    * **UI/客户端层级**
        * Router Cache (浏览器内存，单页应用导航缓存)
        * HTTP Cache (浏览器强缓存/协商缓存)
    * **数据/服务端层级**
        * Request Memoization (React 级别，单次请求内 fetch 去重)
        * Data Cache (Next.js 服务端持久化数据缓存)
        * Full Route Cache (服务端生成的静态 HTML/RSC Payload)

## 2. 怎么用
* **指令化缓存 (`use cache`)** -> *Next.js 15+ 新标准*
    * 作用域：可用于函数、组件、数据库查询。
    * 优势：不仅缓存数据，还能序列化缓存 React 组件树。
* **运行时 API (Connection)**
    * 处理动态上下文（如 `cookies()`, `headers()`）。
    * 在 `use cache` 内部打断缓存，标记为动态内容。
* **更新与失效机制 (Invalidation)**
    * Time-based (时间驱动：revalidate 周期)
    * On-demand (按需驱动：revalidateTag / revalidatePath)
* **安全性注意**：禁止在全局缓存中存储含 User-Specific (用户私有) 数据的函数。

## 3. 渲染模式 (数据决定渲染，缓存改变形态)
* **SSR (服务端渲染)**：数据完全动态，不进 Full Route Cache，每次请求实时计算。
* **SSG (静态页面生成)**：构建时一次性获取数据并缓存整个页面。
  * **ISG (增量静态再生)** 
* **PPR (部分预渲染)** -> *现代最佳实践*
    * **Suspense 边界**：包裹动态数据输入，运行时流式传输。
    * **Static Shell (静态外壳)**
        * 内容：本地计算 / I/O 输入 / 静态 JSON / 基础布局。
        * 加速：使用 `use cache` 指定静态快照，秒级生成外壳。

## 4. 部署架构 (环境决定缓存介质)
* **Serverless Mode (无服务器架构，如 Vercel 默认)**
    * 特点：按需生灭，本地内存/文件系统不可靠（Ephemeral）。
    * 缓存方案：需改为 `use cache remote`，依赖外部分布式缓存（如 Vercel Data Cache, Redis, Upstash）。
* **Serverful Mode (有服务器架构，如 Docker / VPS / 自建 K8s)**
    * 特点：进程常驻，有持久化本地磁盘。
    * 缓存方案：可使用本地磁盘作为 Data Cache，但**多实例集群**部署时，仍需配置集中式 Redis 以防缓存不一致。****



# gemini

# 缓存会话总结

本次会话内容围绕 **Next.js (App Router) 的现代数据流、缓存体系、服务端渲染（RSC）交互以及全栈状态管理**展开。

为了便于你 Review，我将核心要点梳理为以下四个核心模块：

---

### 📦 模块一：Next.js 新缓存硬核机制（`use cache` & `cacheLife`）

* **Profile（预设组合）**：`cacheLife('hours')` 中的 Profile 并非独立的配置文件，而是 Next.js 内置的常用缓存寿命参数组合（包含了默认的 `stale`、`revalidate` 和 `expire` 时间）。
* **三大生命周期参数详解**：
* **`stale`（陈旧期）**：数据变旧，但用户访问时**依然秒回旧缓存**，同时暗中触发后台异步查询去更新缓存（即 SWR 机制的被动触发）。
* **`revalidate`（限流锁）**：限制后台去刷新数据库的频率，避免高并发下大量请求瞬间击穿数据库。 （节流_无论事件触发多频繁，保证回调至少间隔 N 秒执行一次）
* **`expire`（强行过期）**：硬性过期。缓存彻底作废，用户访问必须在**前台同步等待**新数据生成，用于防范过于久远的垃圾数据。（电路熔断：电流过大时保险丝烧断，切断电路保护设备。）


* **CMS 最佳实践**：不要“先发制人地使缓存过期”（即盲目设置很短的定时过期）。对于内容管理系统，推荐使用超长寿命缓存（如 `cacheLife('max')`），当内容实际改变时，再通过 `revalidateTag` 精准点杀。

---

### ⚡ 模块二：数据按需刷新（`updateTag` / `revalidateTag` / `revalidatePath`）

* **适用场景限制**：`updateTag` 和 `revalidatePath` 只能在 **Server Actions** 中运行；而 `revalidateTag` 可以在 Server Actions 和 **Route Handlers (API 路由)** 中通用。
* **`updateTag` 的硬核纠正**：它的底层不是 SWR（陈旧时重新验证），而是 **“立即失效 + 同步重刷”**。它在同一个 Server Action 请求内强行作废旧缓存并现场同步渲染新数据，顺风车带回给浏览器，从而完美实现 **“写后立即可读（Read-your-own-writes）”**。
* **`revalidatePath`**：等同于大范围（页面/路由级）的 `updateTag`，在 Server Action 结束后，页面和服务器缓存会同步刷新，用户无需看旧数据。
* **revalidateTag** 它对指定标记的数据标记为 **缓存脏了**，但不会立即返回新数据
---

### 🔄 模块三：客户端控制台 API（`router.refresh()`）

* **核心功能**：专门在客户端（Client Component）调用，通知服务器重新把当前的服务端组件（Server Components）代码跑一遍。
* **神奇特性**：局部无缝更新，**完美保留客户端的所有 React 状态**（如 `useState`、表单未提交文字、滚动位置），体验极佳。
* **避坑指南**：它无法清除服务器的硬缓存！如果服务端组件内部的数据被 `use cache` 锁死，`router.refresh()` 之后拿到的依然会是旧缓存。必须在服务端先用 `revalidatePath/Tag` 杀掉缓存。

---

### 🏎️ 模块四：乐观更新与全栈路线的决断（React Query vs Next.js 原生）

* **为什么 React Query 乐观更新不需要 transition？**
因为 React Query 的 Mutation 只是纯客户端的 JSON 数据异步流。修改内存缓存、重新渲染局部小组件的计算量极小，主线程一直是活的，绝不卡死页面。
* **为什么 Next.js 原生 `useOptimistic` 必须绑定 `useTransition`？**
因为 Server Action 伴随着全量路由树组件在服务端重洗、庞大 RSC Payload 砸回客户端的重度渲染流程。必须要用 `startTransition` 开启 React 的时间切片防假死，且 `useOptimistic` 完美依赖 Transition 的生命周期来实现**错误时的自动回滚**。
* **React Query + Server Action = 非常冷门**：
两者的底层缓存生死周期、数据更新路线（Client-driven vs Server-driven）天然冲突，强行混用会导致逻辑极度臃肿，且页面仍会被 RSC 全量重洗卡死。
* **业界共识：二选一**
* *路线 A（全栈原生）*：服务端组件 fetch + Server Actions + `useOptimistic` + `revalidateTag`（SEO 极佳）。
* *路线 B（SPA 模式）*：客户端组件 `useQuery` + Route Handlers (API 路由) + React Query 乐观更新（客户端交互极度丝滑）。


* **乐观更新防刷 UX**：通过 `isPending` 立刻禁用按钮（`disabled`）防止幽灵数据。数据展示上，相比传统的 Loading 菊花大转圈，**“乐观数字瞬间改变 + 骨架呼吸灯/幽灵字闪烁（animate-pulse）”** 的设计能带来更高级的“默默同步”感。

---

请 Review。如果有理解偏差、或者需要对某一部分代码实现进行深入探讨的地方，随时告诉我！