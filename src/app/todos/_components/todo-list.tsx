import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TodoItem } from "./todo-item"
import { toggleTodoState } from "../actions"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoListProps {
  todos: Todo[]
}

export function TodoList({ todos }: TodoListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>任务名称</TableHead>
          <TableHead>创建时间</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              暂无任务
            </TableCell>
          </TableRow>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodoState}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
