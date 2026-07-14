"use client"

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TodoItem } from "./todo-item"
import { Todo, Priority } from "../_lib/todo-service"
import { TodoListLoading } from "./todo-list-loading"
import { Badge } from "@/components/ui/badge"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

function getDragOverlayPriorityStyle(priority?: Priority) {
  switch (priority) {
    case 'low': return 'text-green-600 border-green-200 bg-green-50'
    case 'medium': return 'text-yellow-600 border-yellow-200 bg-yellow-50'
    case 'high': return 'text-red-600 border-red-200 bg-red-50'
    default: return 'text-gray-400'
  }
}

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  onToggleSelect?: (id: string) => void
  selectedIds?: Set<string>
  removingIds?: Set<string>
  onReorder?: (orderedIds: string[]) => void
  isPending: boolean
  isLoading?: boolean
}

export function TodoList({ todos, onToggle, onDelete, onEdit, onToggleSelect, selectedIds, removingIds, onReorder, isPending, isLoading = false }: TodoListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 拖拽 8px 后才激活，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setOverId(event.over?.id as string ?? null)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    setOverId(null)
    const { active, over } = event

    if (!over || active.id === over.id) return

    if (onReorder) {
      const oldIndex = todos.findIndex(t => t.id === active.id)
      const newIndex = todos.findIndex(t => t.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = [...todos]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)
      onReorder(reordered.map(t => t.id))
    }
  }, [todos, onReorder])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setOverId(null)
  }, [])

  const todoIds = todos.map(t => t.id)

  const activeTodo = useMemo(() => {
    return activeId ? todos.find(t => t.id === activeId) : null
  }, [activeId, todos])

  // 如果正在加载，显示骨架屏
  if (isLoading) {
    return (
      <Table className="responsive-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] text-center" />
            <TableHead className="w-[60px] text-center font-bold">序号</TableHead>
            <TableHead className="text-center">任务名称</TableHead>
            <TableHead className="w-[80px] text-center hidden md:table-cell">优先级</TableHead>
            <TableHead className="w-[110px] text-center">状态</TableHead>
            <TableHead className="w-[110px] text-center">截止时间</TableHead>
            <TableHead className="w-[110px] text-center hidden sm:table-cell">子任务</TableHead>
            <TableHead className="w-[140px] text-center hidden lg:table-cell">标签</TableHead>
            <TableHead className="w-[140px] text-center hidden lg:table-cell">创建时间</TableHead>
            <TableHead className="w-[90px] text-center hidden md:table-cell">附件</TableHead>
            <TableHead className="w-[140px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={11}>
              <TodoListLoading />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Table className="responsive-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] text-center" />
            <TableHead className="w-[60px] text-center font-bold">序号</TableHead>
            <TableHead className="w-[200px] text-center">任务名称</TableHead>
            <TableHead className="w-[80px] text-center hidden md:table-cell">优先级</TableHead>
            <TableHead className="w-[120px] text-center">状态</TableHead>
            <TableHead className="w-[120px] text-center">截止时间</TableHead>
            <TableHead className="w-[120px] text-center hidden sm:table-cell">子任务</TableHead>
            <TableHead className="w-[150px] text-center hidden lg:table-cell">标签</TableHead>
            <TableHead className="w-[120px] text-center hidden lg:table-cell">创建时间</TableHead>
            <TableHead className="w-[100px] text-center hidden md:table-cell">附件</TableHead>
            <TableHead className="w-[150px] text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
            {todos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                  暂无任务
                </TableCell>
              </TableRow>
            ) : (
              todos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  index={index + 1}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggleSelect={onToggleSelect}
                  isSelected={selectedIds?.has(todo.id)}
                  isPending={isPending}
                  isRemoving={removingIds?.has(todo.id)}
                  isDragging={activeId === todo.id}
                  isOver={overId === todo.id && activeId !== todo.id}
                />
              ))
            )}
          </SortableContext>
        </TableBody>
      </Table>
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeTodo ? (
          <div className="bg-background border-2 border-primary rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3 opacity-95 scale-[1.02] cursor-grabbing">
            <GripVertical className="size-4 text-primary shrink-0" />
            <span className="font-medium truncate">{activeTodo.name}</span>
            {activeTodo.priority && (
              <Badge className={cn("font-normal text-xs shrink-0", getDragOverlayPriorityStyle(activeTodo.priority))}>
                {activeTodo.priority === 'low' ? '低' : activeTodo.priority === 'medium' ? '中' : '高'}
              </Badge>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}