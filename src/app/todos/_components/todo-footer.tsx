"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { setAllTodosCompleted, removeAllTodos } from "../actions"
import { getTodos } from "../_lib/todo-service"

interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoFooterProps {
  initialTodos: Todo[]
}

export function TodoFooter({ initialTodos }: TodoFooterProps) {
  const queryClient = useQueryClient()

  // 使用 useQuery 订阅 todos 数据变化
  const { data: todos = initialTodos } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
    initialData: initialTodos,
    staleTime: Infinity,
  })

  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const pending = total - completed

  const setAllMutation = useMutation({
    mutationFn: (completed: boolean) => setAllTodosCompleted(completed),
    onMutate: async (completed) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"])
      queryClient.setQueryData<Todo[]>(["todos"], (old) =>
        old?.map((t) => ({ ...t, completed }))
      )
      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => removeAllTodos(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"])
      queryClient.setQueryData<Todo[]>(["todos"], [])
      return { previousTodos }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>共 {total} 项任务</span>
      <div className="flex items-center gap-4">
        <span>已完成: {completed}</span>
        <span>待完成: {pending}</span>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={completed === total && total > 0}
            disabled={total === 0}
            onChange={(e) => setAllMutation.mutate(e.target.checked)}
          />
          <span className="text-xs">全部完成</span>
        </div>
        <button
          onClick={() => clearMutation.mutate()}
          disabled={total === 0}
          style={{
            padding: '4px 12px',
            backgroundColor: total === 0 ? '#9ca3af' : '#ef4444',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            cursor: total === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          删除全部
        </button>
      </div>
    </div>
  )
}
