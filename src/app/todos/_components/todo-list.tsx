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
            <TableHead className="w-[120px]">任务名称</TableHead>
            <TableHead className="w-[120px]">优先级</TableHead>
            <TableHead className="w-[120px]">状态</TableHead>
            <TableHead className="w-[120px]">截止时间</TableHead>
            <TableHead className="w-[120px]">创建时间</TableHead>
            <TableHead className="w-[100px]">附件</TableHead>
            <TableHead className="w-[120px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={7}>
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
          <TableHead className="w-[250px]">任务名称</TableHead>
          <TableHead className="w-[80px]">优先级</TableHead>
          <TableHead className="w-[120px]">状态</TableHead>
          <TableHead className="w-[120px]">截止时间</TableHead>
          <TableHead className="w-[120px]">创建时间</TableHead>
          <TableHead className="w-[100px]">附件</TableHead>
          <TableHead className="w-[120px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
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