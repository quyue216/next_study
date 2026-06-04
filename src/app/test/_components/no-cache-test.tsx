import { headers } from 'next/headers'

// 使用 headers() 强制该组件为动态渲染，每次请求都会重新执行
// 与 'use cache' 组件形成对比
export async function DynamicBuildId() {
  headers() // 调用 headers() 标记为动态，确保每次请求都重新生成 UUID
  const buildId = crypto.randomUUID()

  return (
    <div className="p-4 rounded-lg border bg-red-50 border-red-200">
      <p className="text-sm text-red-700 font-semibold">动态渲染区域（无缓存）</p>
      <p className="text-lg font-mono mt-1 break-all">{buildId}</p>
      <p className="text-xs text-muted-foreground mt-2">
        预期：每次刷新页面都会生成新的 UUID
      </p>
    </div>
  )
}
