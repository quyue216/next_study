'use client'


export function TodoHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">任务列表</h1>
      {children}
    </div>
  )
}
