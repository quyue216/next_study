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

export function KanbanBoard({ columns, onEdit, onDelete, onToggle, onMove }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeTodoId = active.id as string
    const overId = over.id as string

    // Find which column the active item is from
    const fromColumn = columns.find(c => c.todos.some(t => t.id === activeTodoId))
    // Find which column the over item is in
    const toColumn = columns.find(c => c.todos.some(t => t.id === overId))

    if (!fromColumn || !toColumn) return

    const toIndex = toColumn.todos.findIndex(t => t.id === overId)
    onMove(activeTodoId, fromColumn.id, toColumn.id, Math.max(0, toIndex))
  }, [columns, onMove])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col min-w-0">
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
              <div className="flex-1 space-y-2 min-h-[200px] rounded-lg bg-muted/30 p-2">
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
        ))}
      </div>
    </DndContext>
  )
}