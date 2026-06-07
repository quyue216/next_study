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