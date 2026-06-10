'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddTodoInputProps {
  onAdd: (name: string) => void
  isPending: boolean
}

export function AddTodoInput({ onAdd, isPending }: AddTodoInputProps) {
  const [value, setValue] = useState('')

  async function handleAdd() {
    if (!value.trim()) return
    onAdd(value.trim())
    setValue('')
  }

  return (
    <div className="mt-3 flex gap-2">
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd()
        }}
        placeholder="请添加任务"
        disabled={isPending}
      />
      <Button onClick={handleAdd} disabled={isPending}>
        {isPending ? '同步中...' : '添加'}
      </Button>
    </div>
  )
}
