"use client"

import { useEffect, useId, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  isPending?: boolean
}

export function TodoItem({ todo, onToggle, onDelete, isPending }: TodoItemProps) {
  const checkboxId = useId()
  const [createdAtText, setCreatedAtText] = useState("")

  useEffect(() => {
    setCreatedAtText(new Date(todo.createdAt).toLocaleString("zh-CN"))
  }, [todo.createdAt])

  return (
    <tr className={`border-b transition-colors hover:bg-muted/50 ${isPending ? "opacity-50" : ""}`}>
      <td className={`p-2 align-middle ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.name}
      </td>
      <td className="p-2 align-middle" suppressHydrationWarning>
        {createdAtText}
      </td>
      <td className="p-2 align-middle">
        <div className="flex items-center gap-2">
          <Checkbox
            id={checkboxId}
            checked={todo.completed}
            disabled={isPending}
            onCheckedChange={(checked) => {
              onToggle(todo.id, checked as boolean)
            }}
          />
          <label htmlFor={checkboxId} className={`text-sm text-muted-foreground ${isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            {todo.completed ? "已完成" : "未完成"}
          </label>
        </div>
      </td>
      <td className="p-2 align-middle">
        <Button
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={() => onDelete(todo.id)}
        >
          删除
        </Button>
      </td>
    </tr>
  )
}
