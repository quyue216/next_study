'use client'

import { useOptimistic, useTransition, useState, useEffect } from 'react'
import { Todo, Priority } from '../_lib/todo-service'
import {
  createTodoClient,
  toggleTodoState,
  removeTodo,
  removeSelectedTodos,
  updateTodoDetails,
  createSubTask,
  removeSubTask,
  removeAttachment,
  uploadTodoAttachments,
  reorderTodos,
} from '../actions'
import { TodoHeader } from './todo-header'
import { TodoList } from './todo-list'
import { AddTodoInput } from './add-todo-input'
import { PaginationOptimized, type PaginationProps } from '@/components/pagination-optimized'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X, Filter, Trash2, CheckSquare, Square } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CreateTodoDialog } from './create-todo-dialog'
import { toast } from 'sonner'

type OptimisticAction =
  | { type: 'add'; tempTodo: Todo }
  | { type: 'toggle'; id: string; completed: boolean }
  | { type: 'delete'; id: string }
  | { type: 'deleteMany'; ids: string[] }
  | { type: 'update'; id: string; data: Partial<Todo> }
  | { type: 'setAll'; completed: boolean }
  | { type: 'clear' }
  | { type: 'reorder'; orderedIds: string[] }

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

  // 选中状态
  const [selectedTodoIds, setSelectedTodoIds] = useState<Set<string>>(new Set())
  // 删除动画中
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

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
        case 'deleteMany':
          return state.filter((t) => !action.ids.includes(t.id))
        case 'update':
          return state.map((t) =>
            t.id === action.id ? { ...t, ...action.data } : t
          )
        case 'setAll':
          return state.map((t) => ({ ...t, completed: action.completed }))
        case 'clear':
          return []
        case 'reorder': {
          const idToTodo = new Map(state.map(t => [t.id, t]))
          return action.orderedIds
            .map(id => idToTodo.get(id))
            .filter((t): t is Todo => t !== undefined)
        }
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
        toast.success('任务已创建')
      } catch (err) {
        toast.error('创建失败，请重试')
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
        toast.error('操作失败，请重试')
        console.error('切换状态失败:', err)
      }
    })
  }

  const handleDelete = (id: string) => {
    // 先触发退出动画
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      startTransition(async () => {
        addOptimisticAction({ type: 'delete', id })
        try {
          await removeTodo(id)
          setDbTodos((prev) => prev.filter((t) => t.id !== id))
          setRemovingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          toast.success('任务已删除')
        } catch (err) {
          setRemovingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          toast.error('删除失败，请重试')
          console.error('删除失败:', err)
        }
      })
    }, 200)
  }

  // 选择处理
  const handleToggleSelect = (todoId: string) => {
    setSelectedTodoIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(todoId)) {
        newSet.delete(todoId)
      } else {
        newSet.add(todoId)
      }
      return newSet
    })
  }

  // 全选/取消全选
  const handleToggleSelectAll = () => {
    if (selectedTodoIds.size === optimisticTodos.length) {
      setSelectedTodoIds(new Set())
    } else {
      setSelectedTodoIds(new Set(optimisticTodos.map(t => t.id)))
    }
  }

  // 批量删除
  const handleDeleteSelected = () => {
    if (selectedTodoIds.size === 0) return

    const idsToDelete = Array.from(selectedTodoIds)
    startTransition(async () => {
      addOptimisticAction({ type: 'deleteMany', ids: idsToDelete })
      try {
        await removeSelectedTodos(idsToDelete)
        setDbTodos((prev) => prev.filter(t => !idsToDelete.includes(t.id)))
        setSelectedTodoIds(new Set())
        toast.success(`已删除 ${idsToDelete.length} 个任务`)
      } catch (err) {
        toast.error('批量删除失败，请重试')
        console.error('批量删除失败:', err)
      }
    })
  }

  const handleReorder = (orderedIds: string[]) => {
    startTransition(async () => {
      addOptimisticAction({ type: 'reorder', orderedIds })
      try {
        await reorderTodos(orderedIds)
      } catch (err) {
        toast.error('排序失败，请重试')
        console.error('排序失败:', err)
      }
    })
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (data: {
    name: string
    priority?: Priority
    dueDate?: string
    tags?: string[]
    newSubTasks?: string[]
    deletedSubTaskIds?: string[]
    newAttachments?: { file: File; previewUrl: string }[]
    deletedAttachmentIds?: string[]
  }) => {
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
        // 1. 更新待办基本信息
        await updateTodoDetails(editingTodo.id, updateData)

        // 2. 删除子任务
        if (data.deletedSubTaskIds?.length) {
          await Promise.all(data.deletedSubTaskIds.map(id => removeSubTask(id)))
        }

        // 3. 添加新子任务
        if (data.newSubTasks?.length) {
          await Promise.all(data.newSubTasks.map(name => createSubTask(editingTodo.id, name)))
        }

        // 4. 删除附件
        if (data.deletedAttachmentIds?.length) {
          await Promise.all(data.deletedAttachmentIds.map(id => removeAttachment(id)))
        }

        // 5. 上传新附件
        if (data.newAttachments?.length) {
          const files = data.newAttachments.map(a => a.file)
          await uploadTodoAttachments(editingTodo.id, files)
        }

        setDbTodos((prev) =>
          prev.map((t) => (t.id === editingTodo.id ? { ...t, ...updateData } : t))
        )
        setIsEditDialogOpen(false)
        setEditingTodo(null)
        toast.success('任务已更新')
      } catch (err) {
        toast.error('更新失败，请重试')
        console.error('更新失败:', err)
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
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-1 max-w-3xl items-center flex-wrap">
              {/* 全选/删除选中按钮组 */}
              <div className="flex gap-2 mr-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSelectAll}
                  disabled={optimisticTodos.length === 0}
                >
                  {selectedTodoIds.size === optimisticTodos.length && optimisticTodos.length > 0 ? (
                    <CheckSquare className="size-4 mr-1" />
                  ) : (
                    <Square className="size-4 mr-1" />
                  )}
                  {selectedTodoIds.size === optimisticTodos.length && optimisticTodos.length > 0 ? '取消全选' : '全选'}
                </Button>
                {selectedTodoIds.size > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                    disabled={isPending}
                  >
                    <Trash2 className="size-4 mr-1" />
                    删除选中 ({selectedTodoIds.size})
                  </Button>
                )}
              </div>

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
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-end gap-4 flex-nowrap overflow-x-auto">
                {/* 完成状态筛选 */}
                <div className="space-y-1 min-w-[120px]">
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
                <div className="space-y-1 min-w-[140px]">
                  <label className="text-sm text-muted-foreground">截止日期从</label>
                  <Input
                    type="date"
                    value={dueDateFrom}
                    onChange={(e) => setDueDateFrom(e.target.value)}
                  />
                </div>

                {/* 截止日期结束 */}
                <div className="space-y-1 min-w-[140px]">
                  <label className="text-sm text-muted-foreground">截止日期到</label>
                  <Input
                    type="date"
                    value={dueDateTo}
                    onChange={(e) => setDueDateTo(e.target.value)}
                  />
                </div>

                {/* 标签筛选 */}
                <div className="space-y-1 min-w-[140px]">
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

                {/* 按钮组 */}
                <div className="flex gap-2 ml-auto shrink-0">
                  <Button type="button" variant="outline" onClick={clearAllFilters}>
                    重置
                  </Button>
                  <Button type="button" onClick={applyFilters}>
                    应用筛选
                  </Button>
                </div>
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
        onToggleSelect={handleToggleSelect}
        selectedIds={selectedTodoIds}
        removingIds={removingIds}
        onReorder={handleReorder}
        isPending={isPending}
        isLoading={isLoading}
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
