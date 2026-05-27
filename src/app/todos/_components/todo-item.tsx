"use client"

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
  return (
    <tr className="border-b transition-colors hover:bg-muted/50" onClick={()=>console.log(89)
    }>
      <td className={`p-2 align-middle ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
        {todo.name}
      </td>
      <td className="p-2 align-middle">
        {new Date(todo.createdAt).toLocaleString("zh-CN")}
      </td>
      <td className="p-2 align-middle">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) => {
              console.log('原生 checkbox:', todo.id, e.target.checked)
              onToggle(todo.id, e.target.checked)
            }}
          />
          <span className="text-sm text-muted-foreground">
            {todo.completed ? "已完成" : "未完成"}
          </span>
        </label>
      </td>
    </tr>
  )
}
