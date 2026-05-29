'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTodoClient } from '../actions'
import { useRouter } from "next/navigation"
export function AddTodoInput() {
  const [value, setValue] = useState('')
  const router = useRouter()
  async function handleAdd() {
    if (!value.trim()) return
    await createTodoClient(value.trim())
    setValue('')
    router.refresh()
  }

  return (
    <div className="mt-3 flex gap-2" onClick={()=>console.log("你好世界")}>
      <Input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="请添加任务"
      />
      <Button onClick={handleAdd}>
        添加
      </Button>
    </div>
  )
}
