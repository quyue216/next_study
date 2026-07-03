"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TodoItem } from "./todo-item"
import { Todo } from "../_lib/todo-service"
import { TodoListLoading } from "./todo-list-loading"

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  isPending: boolean
  isLoading?: boolean // 新增：控制骨架屏显示
}

export function TodoList({ todos, onToggle, onDelete, onEdit, isPending, isLoading = false }: TodoListProps) {
  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] text-center">任务名称</TableHead>
            <TableHead className="w-[80px] text-center">优先级</TableHead>
            <TableHead className="w-[120px] text-center">状态</TableHead>
            <TableHead className="w-[120px] text-center">截止时间</TableHead>
            <TableHead className="w-[150px] text-center">标签</TableHead>
            <TableHead className="w-[120px] text-center">创建时间</TableHead>
            <TableHead className="w-[100px] text-center">附件</TableHead>
            <TableHead className="w-[150px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={8}>
              <TodoListLoading />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px] text-center">任务名称</TableHead>
          <TableHead className="w-[80px] text-center">优先级</TableHead>
          <TableHead className="w-[120px] text-center">状态</TableHead>
          <TableHead className="w-[120px] text-center">截止时间</TableHead>
          <TableHead className="w-[150px] text-center">标签</TableHead>
          <TableHead className="w-[120px] text-center">创建时间</TableHead>
          <TableHead className="w-[100px] text-center">附件</TableHead>
          <TableHead className="w-[150px] text-center">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
              暂无任务
            </TableCell>
          </TableRow>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isPending={isPending}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
