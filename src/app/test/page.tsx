"use client"

import { useState } from "react"

export default function CounterTest() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-3xl font-bold">计数器测试</h1>
      <div className="text-6xl font-mono font-bold text-primary">{count}</div>
      <div className="flex gap-4">
        <button
          onClick={() => setCount(c => c - 1)}
          className="px-6 py-3 rounded-lg bg-muted hover:bg-muted/80 text-lg font-medium transition-colors"
        >
          -1
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-lg font-medium transition-colors"
        >
          重置
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-medium transition-colors"
        >
          +1
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        点击按钮测试客户端交互是否正常
      </p>
    </div>
  )
}
