'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTodoClient } from '../actions'
import { useQueryClient, useMutation } from "@tanstack/react-query"

export function AddTodoInput() {
  const [value, setValue] = useState('')
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: (name: string) => createTodoClient(name),
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      const previousTodos = queryClient.getQueryData<any[]>(["todos"])
      // 乐观更新：临时添加一个待办
      queryClient.setQueryData<any[]>(["todos"], (old) => [
        {
          id: Date.now().toString(),
          name,
          completed: false,
          createdAt: new Date().toISOString(),
        },
        ...(old || []),
      ])
      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  async function handleAdd() {
    if (!value.trim()) return
    addMutation.mutate(value.trim())
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
      />
      <Button onClick={handleAdd} disabled={addMutation.isPending}>
        添加
      </Button>
    </div>
  )
}
