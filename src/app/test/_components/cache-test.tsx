// 'use cache'

// 该组件被 'use cache' 标记，Next.js 会缓存其渲染结果
// 所有用户访问时看到的 buildId 都是相同的，直到重新构建或缓存失效
//
// 注意：'use cache' 组件内不能调用 connection/headers/cookies 等请求相关的 API，
// 否则 Next.js 会将其降级为动态渲染，缓存将失效。
export async function CachedBuildId() {
  // 服务端每次执行都会生成新 UUID，但 'use cache' 会让结果被缓存
  const buildId = crypto.randomUUID()

  return (
    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
      <p className="text-sm text-green-700 font-semibold">use cache 区域（服务端缓存）</p>
      <p className="text-lg font-mono mt-1 break-all">{buildId}</p>
      <p className="text-xs text-muted-foreground mt-2">
        预期：所有用户、每次刷新都看到这个相同的 UUID
      </p>
    </div>
  )
}
