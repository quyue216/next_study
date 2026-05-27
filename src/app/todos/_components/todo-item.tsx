"use client"

import { useId } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const checkboxId = useId()

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className={`p-2 align-middle ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.name}
      </td>
      <td className="p-2 align-middle">
        {new Date(todo.createdAt).toLocaleString("zh-CN")}
      </td>
      <td className="p-2 align-middle">
        <div className="flex items-center gap-2">
          <Checkbox
            id={checkboxId}
            checked={todo.completed}
            onCheckedChange={(checked) => {
              console.log('Checkbox:', todo.id, checked)
              onToggle(todo.id, checked as boolean)
            }}
          />
          <label htmlFor={checkboxId} className="text-sm text-muted-foreground cursor-pointer">
            {todo.completed ? "已完成" : "未完成"}
          </label>
        </div>
      </td>
    </tr>
  )
}
