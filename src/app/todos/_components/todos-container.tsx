'use client'

import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { Todo } from '../_lib/todo-service'
import {
  createTodoClient,
  toggleTodoState,
  removeTodo,
  setAllTodosCompleted,
  removeAllTodos,
} from '../actions'
import { TodoHeader } from './todo-header'
import { TodoList } from './todo-list'
import { TodoFooter } from './todo-footer'
import { AddTodoInput } from './add-todo-input'
import { cn } from '@/lib/utils'

type OptimisticAction =
  | { type: 'add'; tempTodo: Todo }
  | { type: 'toggle'; id: string; completed: boolean }
  | { type: 'delete'; id: string }
  | { type: 'setAll'; completed: boolean }
  | { type: 'clear' }

interface TodosContainerProps {
  initialTodos: Todo[]
  userEmail?: string
}

export function TodosContainer({ initialTodos, userEmail }: TodosContainerProps) {
  const [dbTodos, setDbTodos] = useState<Todo[]>(initialTodos)
  const [isPending, startTransition] = useTransition()

  // 服务端传入新的 initialTodos 时同步更新真实状态
  useEffect(() => {
    setDbTodos(initialTodos)
  }, [initialTodos])

  // useOptimistic：以 dbTodos 为基准，乐观更新瞬时生效，出错时 React 自动回滚
  const [optimisticTodos, addOptimisticAction] = useOptimistic(
    dbTodos,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case 'add':
          return [action.tempTodo, ...state]
        case 'toggle':
          return state.map((t) =>
            t.id === action.id ? { ...t, completed: action.completed } : t
          )
        case 'delete':
          return state.filter((t) => t.id !== action.id)
        case 'setAll':
          return state.map((t) => ({ ...t, completed: action.completed }))
        case 'clear':
          return []
        default:
          return state
      }
    }
  )

  const handleAdd = (name: string) => {
    const tempTodo: Todo = {
      id: `temp-${Date.now()}`,
      name,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    startTransition(async () => {
      addOptimisticAction({ type: 'add', tempTodo })
      try {
        const newTodos = await createTodoClient(name)
        
        if (newTodos) setDbTodos(newTodos)
      } catch (err) {
        console.error('添加失败:', err)
      }
    })
  }

  const handleToggle = (id: string, completed: boolean) => {
    startTransition(async () => {
      addOptimisticAction({ type: 'toggle', id, completed })
      try {
        await toggleTodoState(id, completed)
        setDbTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed } : t))
        )
      } catch (err) {
        console.error('切换状态失败:', err)
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      addOptimisticAction({ type: 'delete', id })
      try {
        await removeTodo(id)
        setDbTodos((prev) => prev.filter((t) => t.id !== id))
      } catch (err) {
        console.error('删除失败:', err)
      }
    })
  }

  const handleSetAll = (completed: boolean) => {
    startTransition(async () => {
      addOptimisticAction({ type: 'setAll', completed })
      try {
        await setAllTodosCompleted(completed)
        setDbTodos((prev) => prev.map((t) => ({ ...t, completed })))
      } catch (err) {
        console.error('设置全部完成状态失败:', err)
      }
    })
  }

  const handleClear = () => {
    startTransition(async () => {
      addOptimisticAction({ type: 'clear' })
      try {
        await removeAllTodos()
        setDbTodos([])
      } catch (err) {
        console.error('删除全部失败:', err)
      }
    })
  }

  return (
    <div className="space-y-4">
      <TodoHeader email={userEmail}>
        <AddTodoInput onAdd={handleAdd} isPending={isPending} />
      </TodoHeader>

      <TodoList
        todos={optimisticTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        isPending={isPending}
      />

      <TodoFooter
        todos={optimisticTodos}
        onSetAll={handleSetAll}
        onClear={handleClear}
        isPending={isPending}
      />

      {/* 同步中全局指示器 */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 text-xs text-blue-500 animate-pulse">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          正在与服务器同步...
        </div>
      )}
    </div>
  )
}
