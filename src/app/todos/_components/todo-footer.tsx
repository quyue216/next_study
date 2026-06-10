'use client'

import { Todo } from '../_lib/todo-service'
import { cn } from '@/lib/utils'

interface TodoFooterProps {
  todos: Todo[]
  onSetAll: (completed: boolean) => void
  onClear: () => void
  isPending: boolean
}

export function TodoFooter({ todos, onSetAll, onClear, isPending }: TodoFooterProps) {
  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const pendingCount = total - completed
  const allChecked = completed === total && total > 0

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>共 {total} 项任务</span>
      <div className="flex items-center gap-4">
        <span>已完成: {completed}</span>
        <span>待完成: {pendingCount}</span>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allChecked}
            disabled={total === 0 || isPending}
            onChange={(e) => onSetAll(e.target.checked)}
            className="cursor-pointer disabled:cursor-not-allowed"
          />
          <span className={cn('text-xs', isPending && 'text-blue-500')}>
            {isPending ? '同步中...' : '全部完成'}
          </span>
        </div>

        <button
          onClick={onClear}
          disabled={total === 0 || isPending}
          className={cn(
            'px-3 py-1 rounded-md text-white text-sm transition-all',
            total === 0 || isPending
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 active:scale-95'
          )}
        >
          {isPending ? '同步中...' : '删除全部'}
        </button>
      </div>
    </div>
  )
}
