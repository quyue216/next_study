import { Suspense } from 'react'
import { CachedBuildId } from './_components/cache-test'
import { DynamicBuildId } from './_components/no-cache-test'

async function PostList() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', {
    // 禁用 Next.js 数据缓存，每次请求都重新获取数据
    // 否则刷新页面会直接返回缓存结果，看不到 Suspense loading 效果
    cache: 'no-store',
  })
  const posts = await res.json()

  return (
    <ul className="space-y-3">
      {posts.map((post: { id: number; title: string }) => (
        <li key={post.id} className="p-3 rounded-lg border bg-card">
          <span className="font-medium">{post.id}. {post.title}</span>
        </li>
      ))}
    </ul>
  )
}

async function SlowPostList() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3&_start=5', {
    // 禁用 Next.js 数据缓存，每次请求都重新获取数据
    cache: 'no-store',
  })
  const posts = await res.json()

  return (
    <ul className="space-y-3">
      {posts.map((post: { id: number; title: string }) => (
        <li key={post.id} className="p-3 rounded-lg border bg-card">
          <span className="font-medium">{post.id}. {post.title}</span>
        </li>
      ))}
    </ul>
  )
}

function Fallback({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground p-3">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span>{label}</span>
    </div>
  )
}

export default function Page() {
  return (
    <main className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Next.js 特性测试</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">缓存对比测试</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <CachedBuildId />
          <DynamicBuildId />
        </div>
        <p className="text-sm text-muted-foreground">
          同时打开多个浏览器窗口或无痕窗口访问此页面，观察左右两个 UUID 的行为差异。
        </p>
      </section>

      <hr />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Suspense + Streaming 测试</h2>
        <Suspense fallback={<Fallback label="Loading fast posts..." />}>
          <PostList />
        </Suspense>
        <Suspense fallback={<Fallback label="Loading slow posts..." />}>
          <SlowPostList />
        </Suspense>
      </section>
    </main>
  )
}
