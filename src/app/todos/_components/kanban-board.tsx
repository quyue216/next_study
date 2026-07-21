"use client"

import { useCallback, useState } from "react"
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Todo } from "../_lib/todo-service"
import { cn } from "@/lib/utils"
import { KanbanCard } from "./kanban-card"

type Column = {
  id: string
  title: string
  todos: Todo[]
}

interface KanbanBoardProps {
  columns: Column[]
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggle: (id: string, completed: boolean) => void
  onMove: (todoId: string, fromStatus: string, toStatus: string, toIndex: number) => void
}

/** 每个列内部使用 useDroppable，让空列也能接收拖放 */
function DroppableColumn({
  column,
  activeId,
  onEdit,
  onDelete,
  onToggle,
}: {
  column: Column
  activeId: UniqueIdentifier | null
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggle: (id: string, completed: boolean) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { containerId: column.id },
  })

  return (
    <div className="flex flex-col min-w-0">
      <div className={cn(
        "flex items-center justify-between mb-3 px-1",
        column.id === "todo" && "text-blue-600 dark:text-blue-400",
        column.id === "in_progress" && "text-yellow-600 dark:text-yellow-400",
        column.id === "done" && "text-green-600 dark:text-green-400",
      )}>
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <span className="text-xs bg-muted rounded-full px-2 py-0.5">
          {column.todos.length}
        </span>
      </div>

      <SortableContext
        items={column.todos.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 space-y-2 min-h-[200px] rounded-lg bg-muted/30 p-2 transition-colors",
            isOver && "ring-2 ring-primary/50 bg-primary/5"
          )}
        >
          {column.todos.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
              暂无任务
            </div>
          ) : (
            column.todos.map(todo => (
              <KanbanCard
                key={todo.id}
                todo={todo}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={onToggle}
                isDragging={activeId === todo.id}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ columns, onEdit, onDelete, onToggle, onMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [overColumnId, setOverColumnId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setOverColumnId(null)
      return
    }

    // 如果 over 的是一个 todo 元素，找到它所在的列
    const overColumn = columns.find(c => c.todos.some(t => t.id === over.id))
    if (overColumn) {
      setOverColumnId(overColumn.id)
    } else {
      // 如果 over 的是列容器本身（空列的情况），通过 data 属性识别
      const overData = over.data?.current as { containerId?: string } | undefined
      if (overData?.containerId) {
        setOverColumnId(overData.containerId)
      }
    }
  }, [columns])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTodoId = active.id as string
    const overId = over.id as string

    // Find which column the active item is from
    const fromColumn = columns.find(c => c.todos.some(t => t.id === activeTodoId))

    // 优先使用 over 元素所在的列，其次使用 dragOver 跟踪的列
    let toColumn = columns.find(c => c.todos.some(t => t.id === overId))

    if (!toColumn && overColumnId) {
      toColumn = columns.find(c => c.id === overColumnId)
    }

    if (!fromColumn || !toColumn) return

    // 如果拖到同一个列，只在列内排序
    if (fromColumn.id === toColumn.id) {
      const toIndex = toColumn.todos.findIndex(t => t.id === overId)
      if (toIndex === -1) return
      onMove(activeTodoId, fromColumn.id, toColumn.id, Math.max(0, toIndex))
      return
    }

    // 跨列拖拽：如果目标列有 todo，插入到该 todo 之前；如果目标列为空，插入到末尾
    const toIndex = overColumnId === toColumn.id && toColumn.todos.length > 0
      ? toColumn.todos.findIndex(t => t.id === overId)
      : toColumn.todos.length
    onMove(activeTodoId, fromColumn.id, toColumn.id, Math.max(0, toIndex))
  }, [columns, onMove, overColumnId])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <DroppableColumn
            key={column.id}
            column={column}
            activeId={activeId}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
      </div>
    </DndContext>
  )
}