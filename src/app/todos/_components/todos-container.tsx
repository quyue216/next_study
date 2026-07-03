'use client'

import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { Todo, Priority } from '../_lib/todo-service'
import {
  createTodoClient,
  toggleTodoState,
  removeTodo,
  setAllTodosCompleted,
  removeAllTodos,
  updateTodoDetails,
} from '../actions'
import { TodoHeader } from './todo-header'
import { TodoList } from './todo-list'
import { TodoFooter } from './todo-footer'
import { AddTodoInput } from './add-todo-input'
import { PaginationOptimized, type PaginationProps } from '@/components/pagination-optimized'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CreateTodoDialog } from './create-todo-dialog'

type OptimisticAction =
  | { type: 'add'; tempTodo: Todo }
  | { type: 'toggle'; id: string; completed: boolean }
  | { type: 'delete'; id: string }
  | { type: 'update'; id: string; data: Partial<Todo> }
  | { type: 'setAll'; completed: boolean }
  | { type: 'clear' }

interface TodosContainerProps {
  initialTodos: Todo[]
  userEmail?: string
  filters?: {
    search?: string
    completed?: boolean
    dueDateFrom?: string
    dueDateTo?: string
    tag?: string
  }
  allTags?: string[]
  pagination?: PaginationProps
  isLoading?: boolean
}

export function TodosContainer({ initialTodos, userEmail, filters, allTags = [], pagination, isLoading = false }: TodosContainerProps) {
  const [dbTodos, setDbTodos] = useState<Todo[]>(initialTodos)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 搜索状态
  const [searchInput, setSearchInput] = useState(filters?.search || '')
  const [completedFilter, setCompletedFilter] = useState<string>(filters?.completed !== undefined ? String(filters.completed) : '')
  const [dueDateFrom, setDueDateFrom] = useState(filters?.dueDateFrom || '')
  const [dueDateTo, setDueDateTo] = useState(filters?.dueDateTo || '')
  const [selectedTag, setSelectedTag] = useState(filters?.tag || '')
  const [showFilters, setShowFilters] = useState(false)

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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
        case 'update':
          return state.map((t) =>
            t.id === action.id ? { ...t, ...action.data } : t
          )
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
        await createTodoClient(name)
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

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (data: { name: string; priority?: Priority; dueDate?: string; tags?: string[] }) => {
    if (!editingTodo) return

    const updateData = {
      name: data.name,
      priority: data.priority,
      dueDate: data.dueDate,
      tags: data.tags,
    }

    startTransition(async () => {
      addOptimisticAction({ type: 'update', id: editingTodo.id, data: updateData })
      try {
        await updateTodoDetails(editingTodo.id, updateData)
        setDbTodos((prev) =>
          prev.map((t) => (t.id === editingTodo.id ? { ...t, ...updateData } : t))
        )
        setIsEditDialogOpen(false)
        setEditingTodo(null)
      } catch (err) {
        console.error('更新失败:', err)
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

  // 执行搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  // 应用所有筛选条件
  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)

      // 重置到第一页
      params.delete('page')

      // 关键词搜索
      if (searchInput.trim()) {
        params.set('search', searchInput.trim())
      } else {
        params.delete('search')
      }

      // 完成状态
      if (completedFilter) {
        params.set('completed', completedFilter)
      } else {
        params.delete('completed')
      }

      // 截止日期
      if (dueDateFrom) {
        params.set('dueDateFrom', dueDateFrom)
      } else {
        params.delete('dueDateFrom')
      }

      if (dueDateTo) {
        params.set('dueDateTo', dueDateTo)
      } else {
        params.delete('dueDateTo')
      }

      // 标签
      if (selectedTag) {
        params.set('tag', selectedTag)
      } else {
        params.delete('tag')
      }

      router.push(`?${params.toString()}`)
    })
  }

  // 清除所有筛选条件
  const clearAllFilters = () => {
    startTransition(() => {
      setSearchInput('')
      setCompletedFilter('')
      setDueDateFrom('')
      setDueDateTo('')
      setSelectedTag('')

      const params = new URLSearchParams(searchParams)
      params.delete('search')
      params.delete('completed')
      params.delete('dueDateFrom')
      params.delete('dueDateTo')
      params.delete('tag')
      params.delete('page')
      router.push(`?${params.toString()}`)
    })
  }

  // 检查是否有活跃的筛选条件
  const hasActiveFilters = !!(searchInput || completedFilter || dueDateFrom || dueDateTo || selectedTag)

  return (
    <div className="space-y-4">
      <TodoHeader email={userEmail}>
        <div className="space-y-3">
          {/* 顶部搜索和添加按钮容器 */}
          <div className="flex gap-2 items-center justify-between">
            <div className="flex gap-2 flex-1 max-w-2xl items-center">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="搜索任务..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => { setSearchInput(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" disabled={isPending}>
                  搜索
                </Button>
              </form>

              {/* 筛选按钮 */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(hasActiveFilters && 'border-blue-500 text-blue-500')}
              >
                <Filter className="size-4 mr-1" />
                筛选
                {hasActiveFilters && <span className="ml-1 text-xs">(有)</span>}
              </Button>

              {/* 清除筛选按钮 */}
              {hasActiveFilters && (
                <Button type="button" variant="ghost" onClick={clearAllFilters}>
                  清除筛选
                </Button>
              )}
            </div>
            <AddTodoInput onAdd={handleAdd} isPending={isPending} />
          </div>

          {/* 展开的筛选面板 */}
          {showFilters && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 完成状态筛选 */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">完成状态</label>
                  <Select value={completedFilter} onValueChange={setCompletedFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="全部" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部</SelectItem>
                      <SelectItem value="true">已完成</SelectItem>
                      <SelectItem value="false">未完成</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 截止日期起始 */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">截止日期从</label>
                  <Input
                    type="date"
                    value={dueDateFrom}
                    onChange={(e) => setDueDateFrom(e.target.value)}
                  />
                </div>

                {/* 截止日期结束 */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">截止日期到</label>
                  <Input
                    type="date"
                    value={dueDateTo}
                    onChange={(e) => setDueDateTo(e.target.value)}
                  />
                </div>

                {/* 标签筛选 */}
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">标签</label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="全部标签" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部</SelectItem>
                      {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={clearAllFilters}>
                  重置
                </Button>
                <Button type="button" onClick={applyFilters}>
                  应用筛选
                </Button>
              </div>
            </div>
          )}
        </div>
      </TodoHeader>

      <TodoList
        todos={optimisticTodos}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
        isPending={isPending}
        isLoading={isLoading}
      />

      <TodoFooter
        todos={optimisticTodos}
        onSetAll={handleSetAll}
        onClear={handleClear}
        isPending={isPending}
      />

      {/* 服务端分页器 */}
      {pagination && pagination.total > 0 && (
        <PaginationOptimized
          total={pagination.total}
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
        />
      )}

      {/* 同步中全局指示器 */}
      {isPending && (
        <div className="flex items-center justify-center gap-2 text-xs text-blue-500 animate-pulse">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          正在与服务器同步...
        </div>
      )}

      {/* 编辑对话框 */}
      <CreateTodoDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingTodo(null)
          }
        }}
        todo={editingTodo}
        onSubmit={handleUpdate}
      />
    </div>
  )
}
