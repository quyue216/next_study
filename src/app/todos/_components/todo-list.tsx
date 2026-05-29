"use client"

import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TodoItem } from "./todo-item"
import { toggleTodoState, removeTodo } from "../actions"
import { getTodos } from "../_lib/todo-service"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoListProps {
  initialTodos: Todo[]
}

export function TodoList({ initialTodos }: TodoListProps) {
  const queryClient = useQueryClient()

  // 当服务端传入新的 initialTodos 时，同步更新 React Query 缓存
  useEffect(() => {
    queryClient.setQueryData(["todos"], initialTodos)
  }, [initialTodos, queryClient])

  // 使用 React Query 管理状态
  const { data: todos = [] } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
    initialData: initialTodos,
    staleTime: Infinity,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTodoState(id, completed),
    onMutate: async ({ id, completed }) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"])
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed } : t))
      )
      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      // 回滚
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeTodo(id),
    onMutate: async (id) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"])
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.filter((t) => t.id !== id)
      )
      return { previousTodos }
    },
    onError: (_err, _id, context) => {
      // 回滚
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  const handleToggle = (id: string, completed: boolean) => {
    toggleMutation.mutate({ id, completed })
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

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
              onToggle={handleToggle}
              onDelete={handleDelete}
              isPending={toggleMutation.isPending && toggleMutation.variables?.id === todo.id}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
