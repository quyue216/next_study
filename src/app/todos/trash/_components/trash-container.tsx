"use client"

import { useState, useTransition } from "react"
import { Todo } from "../../_lib/todo-service"
import { restoreTodoFromTrash, restoreSelectedTodos, permanentlyDeleteTodoAction, emptyTrash } from "../../actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationOptimized, type PaginationProps } from "@/components/pagination-optimized"
import { toast } from "sonner"
import { Trash2, Undo2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TrashContainerProps {
  deletedTodos: Todo[]
  userEmail?: string
  pagination?: PaginationProps
}

export function TrashContainer({ deletedTodos, userEmail, pagination }: TrashContainerProps) {
  const [todos, setTodos] = useState<Todo[]>(deletedTodos)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const handleRestore = (id: string) => {
    startTransition(async () => {
      try {
        await restoreTodoFromTrash(id)
        setTodos(prev => prev.filter(t => t.id !== id))
        toast.success("已恢复")
      } catch {
        toast.error("恢复失败，请重试")
      }
    })
  }

  const handleRestoreSelected = () => {
    if (selectedIds.size === 0) return
    startTransition(async () => {
      try {
        await restoreSelectedTodos(Array.from(selectedIds))
        setTodos(prev => prev.filter(t => !selectedIds.has(t.id)))
        setSelectedIds(new Set())
        toast.success(`已恢复 ${selectedIds.size} 个任务`)
      } catch {
        toast.error("恢复失败，请重试")
      }
    })
  }

  const handlePermanentlyDelete = (id: string) => {
    startTransition(async () => {
      try {
        await permanentlyDeleteTodoAction(id)
        setTodos(prev => prev.filter(t => t.id !== id))
        toast.success("已永久删除")
      } catch {
        toast.error("删除失败，请重试")
      }
    })
  }

  const handleEmptyTrash = () => {
    if (todos.length === 0) return
    startTransition(async () => {
      try {
        await emptyTrash()
        setTodos([])
        setSelectedIds(new Set())
        toast.success("回收站已清空")
      } catch {
        toast.error("清空失败，请重试")
      }
    })
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.size === todos.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(todos.map(t => t.id)))
    }
  }

  const getDaysRemaining = (deletedAt: string) => {
    const deleted = new Date(deletedAt)
    const expires = new Date(deleted.getTime() + 30 * 24 * 60 * 60 * 1000)
    const remaining = Math.ceil((expires.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    return Math.max(0, remaining)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/todos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              返回任务列表
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">回收站</h1>
          <span className="text-sm text-muted-foreground">
            {todos.length} 个已删除任务 · 30天后自动清理
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreSelected}
              disabled={isPending}
            >
              <Undo2 className="size-4 mr-1" />
              恢复选中 ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmptyTrash}
            disabled={isPending || todos.length === 0}
          >
            <Trash2 className="size-4 mr-1" />
            清空回收站
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px] text-center">
              <Checkbox
                checked={todos.length > 0 && selectedIds.size === todos.length}
                onCheckedChange={handleToggleSelectAll}
                disabled={todos.length === 0}
              />
            </TableHead>
            <TableHead className="text-center">任务名称</TableHead>
            <TableHead className="w-[120px] text-center">优先级</TableHead>
            <TableHead className="w-[160px] text-center">删除时间</TableHead>
            <TableHead className="w-[120px] text-center">剩余天数</TableHead>
            <TableHead className="w-[200px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {todos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                回收站为空
              </TableCell>
            </TableRow>
          ) : (
            todos.map(todo => {
              const days = getDaysRemaining(todo.deletedAt || "")
              return (
                <TableRow key={todo.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.has(todo.id)}
                      onCheckedChange={() => handleToggleSelect(todo.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {todo.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {todo.priority ? (
                      <Badge variant="outline" className="font-normal">
                        {todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {todo.deletedAt ? new Date(todo.deletedAt).toLocaleString("zh-CN") : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={days <= 3 ? "destructive" : days <= 7 ? "secondary" : "outline"}>
                      {days} 天
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(todo.id)}
                        disabled={isPending}
                      >
                        <Undo2 className="size-4 mr-1" />
                        恢复
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handlePermanentlyDelete(todo.id)}
                        disabled={isPending}
                      >
                        永久删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {pagination && pagination.total > 0 && (
        <PaginationOptimized
          total={pagination.total}
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalPages={pagination.totalPages}
        />
      )}
    </div>
  )
}