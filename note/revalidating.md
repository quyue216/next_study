
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

