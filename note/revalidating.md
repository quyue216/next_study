
revalidating (缓存何时更新/失效)
    基于时间
        cacheLife (设置 stale / revalidate / expire 三阶段)
            缓存生命周期
                stale: 缓存为新鲜数据，用户可以直接消费
                revalidate: 用户缓存已经不新鲜，next.js会进行更新操作 (用户在更新期间重复访问仍然是旧的)
                expire: 缓存已经过期，用户需要等待缓存更新才能进行消费
        cacheTag (缓存标签)
    按需重新验证
        revalidateTag  →  后台刷新，先返回旧内容，下次请求拿新内容
        updateTag      →  立即失效，保证写后立即可读
            useTransition (前端界面需要展示lading, updateTag作废缓存,缓存更新需要时间,界面展示loading作为提示)
        revalidatePath →  按路径刷新（不推荐，不够精确）


服务端渲染为了提高响应速度与节约资源，外部数据和数据库查询都作缓存以便快速响应用户。缓存并不是持久化数据，它也需要在恰当的时机进行更新，更新规则如下
1. SWR 
2. 

>API使用不要盲目设置过期时间，应该采用长缓存 + 精准点杀


服务端数据与客户端保持一致


# 乐观更新

optimistic update
    是什么 举例子：点赞 todo任务添加，数据在没有落库前，前端本地先行更新。
    实现
    react query 服务端状态管理库
    useOptimistic+useTransition
        useOptimistic_react hooksAPI快捷管理乐观更新状态, 成功会将乐观更新临时状态替换为真实状态，失败它会自动回退状态
        useTransition server actions函数返回RSC组件(所有层级)，react进行对比与渲染会占用主线程较长时间，用户进行交互会受到阻塞。它可以给渲染标记为低优先级，用户交互优先响应 
            并发渲染
            fiber 架构
    router.refresh 当前页面所对于服务端组件全部重新渲染一遍并返回给客户端，客户端会进行数据覆盖操作 (它并不会清除掉缓存)
    zodstand


# 水合
