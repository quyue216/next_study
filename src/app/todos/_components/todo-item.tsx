import { Badge } from "@/components/ui/badge"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-2 align-middle">{todo.name}</td>
      <td className="p-2 align-middle">
        {new Date(todo.createdAt).toLocaleString("zh-CN")}
      </td>
      <td className="p-2 align-middle">
        <Badge variant={todo.completed ? "default" : "outline"}>
          {todo.completed ? "已完成" : "未完成"}
        </Badge>
      </td>
    </tr>
  )
}
