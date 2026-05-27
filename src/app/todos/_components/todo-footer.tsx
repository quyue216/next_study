"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { setAllTodosCompleted } from "../actions"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoFooterProps {
  todos: Todo[]
}

export function TodoFooter({ todos }: TodoFooterProps) {
  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const pending = total - completed

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>共 {total} 项任务</span>
      <div className="flex items-center gap-4">
        <span>已完成: {completed}</span>
        <span>待完成: {pending}</span>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={completed === total && total > 0}
            indeterminate={completed > 0 && completed < total}
            onCheckedChange={(checked) => setAllTodosCompleted(checked as boolean)}
          />
          <span className="text-xs">全部完成</span>
        </div>
      </div>
    </div>
  )
}
