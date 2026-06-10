"use client"

import { useEffect, useId, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Todo } from "../_lib/todo-service"

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

  const isTemp = todo.id.startsWith('temp-')

  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50",
        isTemp && "bg-blue-50/50 dark:bg-blue-950/20",
        isPending && isTemp && "animate-pulse"
      )}
    >
      <td className={cn("p-2 align-middle", todo.completed && "line-through text-muted-foreground")}>
        {todo.name}
        {isTemp && (
          <span className="ml-2 text-[10px] text-blue-500 font-medium">
            同步中
          </span>
        )}
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
          <label htmlFor={checkboxId} className="text-sm text-muted-foreground cursor-pointer">
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
