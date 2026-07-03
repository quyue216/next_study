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
  onToggleSelect?: (id: string) => void
  selectedIds?: Set<string>
  isPending: boolean
  isLoading?: boolean
}

export function TodoList({ todos, onToggle, onDelete, onEdit, onToggleSelect, selectedIds, isPending, isLoading = false }: TodoListProps) {
  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center"></TableHead>
            <TableHead className="text-center">任务名称</TableHead>
            <TableHead className="w-[80px] text-center">优先级</TableHead>
            <TableHead className="w-[110px] text-center">状态</TableHead>
            <TableHead className="w-[110px] text-center">截止时间</TableHead>
            <TableHead className="w-[140px] text-center">标签</TableHead>
            <TableHead className="w-[140px] text-center">创建时间</TableHead>
            <TableHead className="w-[90px] text-center">附件</TableHead>
            <TableHead className="w-[140px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={9}>
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
          <TableHead className="w-[50px] text-center"></TableHead>
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
            <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
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
              onToggleSelect={onToggleSelect}
              isSelected={selectedIds?.has(todo.id)}
              isPending={isPending}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
