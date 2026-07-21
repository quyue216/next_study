"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Todo, Priority } from "../_lib/todo-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GripVertical, Edit3, Trash2, Calendar } from "lucide-react"

interface KanbanCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggle: (id: string, completed: boolean) => void
  isDragging?: boolean
}

function getPriorityInfo(priority?: Priority) {
  switch (priority) {
    case "low": return { text: "低", className: "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20" }
    case "medium": return { text: "中", className: "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20" }
    case "high": return { text: "高", className: "text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20" }
    default: return null
  }
}

export function KanbanCard({ todo, onEdit, onDelete, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const priorityInfo = getPriorityInfo(todo.priority)
  const subTasks = todo.subTasks ?? []
  const subTaskCompleted = subTasks.filter(st => st.completed).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm cursor-default",
        isDragging && "shadow-lg ring-2 ring-primary"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none shrink-0"
          aria-label="拖拽排序"
          tabIndex={-1}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "text-sm font-medium truncate",
              todo.completed && "line-through text-muted-foreground"
            )}>
              {todo.name}
            </span>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6"
                onClick={() => onEdit(todo)}
              >
                <Edit3 className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="size-6 text-destructive"
                onClick={() => onDelete(todo.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {priorityInfo && (
              <Badge variant="outline" className={cn("text-xs px-1.5 py-0", priorityInfo.className)}>
                {priorityInfo.text}
              </Badge>
            )}

            {todo.dueDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(todo.dueDate).toLocaleDateString("zh-CN")}
              </span>
            )}
          </div>

          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {todo.tags.map((tag, i) => (
                <Badge key={`${tag}-${i}`} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {subTasks.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      subTaskCompleted === subTasks.length ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${subTasks.length > 0 ? Math.round((subTaskCompleted / subTasks.length) * 100) : 0}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {subTaskCompleted}/{subTasks.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}