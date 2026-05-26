'use client'

import { useState } from 'react'
import { createTodoClient } from '../actions'

export function AddTodoInput() {
  const [value, setValue] = useState('')

  async function handleAdd() {
    if (!value.trim()) return
    await createTodoClient(value.trim())
    setValue('')
  }

  return (
    <div className="mt-3 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="请添加任务"
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        onClick={handleAdd}
        className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        添加
      </button>
    </div>
  )
}
