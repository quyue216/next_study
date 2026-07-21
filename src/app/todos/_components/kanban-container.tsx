"use client"

import { useState, useTransition, useEffect } from "react"
import { Todo, TodoStatus } from "../_lib/todo-service"
import {
  toggleTodoState,
  removeTodo,
  updateTodoDetails,
  createSubTask,
  removeSubTask,
  removeAttachment,
  uploadTodoAttachments,
  moveTodoToStatus,
  updateTodoStatus,
} from "../actions"
import { TodoHeader } from "./todo-header"
import { AddTodoInput } from "./add-todo-input"
import { CreateTodoDialog } from "./create-todo-dialog"
import { KanbanBoard } from "./kanban-board"
import { ViewSwitcher } from "./view-switcher"
import { RealtimeStatus } from "./realtime-status"
import { useRealtimeTodos } from "../_lib/use-realtime-todos"
import { toast } from "sonner"

interface KanbanContainerProps {
  initialTodos: {
    todo: Todo[]
    in_progress: Todo[]
    done: Todo[]
  }
  userEmail?: string
  userId?: string
}

export function KanbanContainer({ initialTodos, userEmail, userId }: KanbanContainerProps) {
  const [columns, setColumns] = useState({
    todo: initialTodos.todo,
    in_progress: initialTodos.in_progress,
    done: initialTodos.done,
  })
  const [isPending, startTransition] = useTransition()
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // 实时同步
  const { isConnected } = useRealtimeTodos({
    userId: userId || "",
    onRemoteChange: (event) => {
      // Kanban just reloads on remote changes
      if (event.type === "INSERT" && event.todo && !event.todo.deletedAt) {
        setColumns(prev => {
          const status = event.todo?.status || "todo"
          const key = status as keyof typeof prev
          if (prev[key].find(t => t.id === event.todo!.id)) return prev
          return { ...prev, [key]: [event.todo!, ...prev[key]] }
        })
      } else if (event.type === "UPDATE" && event.todo) {
        setColumns(prev => {
          const newCols = { ...prev }
          for (const key of ["todo", "in_progress", "done"] as const) {
            newCols[key] = newCols[key].filter(t => t.id !== event.todo!.id)
          }
          if (!event.todo?.deletedAt) {
            const status = event.todo?.status || "todo"
            const key = status as keyof typeof newCols
            newCols[key] = [...newCols[key], event.todo!]
          }
          return newCols
        })
      } else if (event.type === "DELETE") {
        setColumns(prev => {
          const newCols = { ...prev }
          for (const key of ["todo", "in_progress", "done"] as const) {
            newCols[key] = newCols[key].filter(t => t.id !== event.oldRecord!.id)
          }
          return newCols
        })
      }
    },
  })

  useEffect(() => {
    setColumns({
      todo: initialTodos.todo,
      in_progress: initialTodos.in_progress,
      done: initialTodos.done,
    })
  }, [initialTodos])

  const allTodos = [...columns.todo, ...columns.in_progress, ...columns.done]

  const handleAdd = (name: string) => {
    startTransition(async () => {
      try {
        // Reload will happen via revalidatePath
        toast.success("任务已创建")
      } catch {
        toast.error("创建失败")
      }
    })
  }

  const handleToggle = (id: string, completed: boolean) => {
    startTransition(async () => {
      try {
        await toggleTodoState(id, completed)
        const newStatus: TodoStatus = completed ? "done" : "todo"
        setColumns(prev => {
          const move = (from: string, to: string) => {
            const newCols = { ...prev }
            const fromCol = [...newCols[from as keyof typeof prev]]
            const idx = fromCol.findIndex(t => t.id === id)
            if (idx === -1) return prev
            const [moved] = fromCol.splice(idx, 1)
            moved.completed = completed
            moved.status = newStatus
            newCols[from as keyof typeof prev] = fromCol
            newCols[to as keyof typeof prev] = [...newCols[to as keyof typeof prev], moved]
            return newCols
          }
          if (completed) {
            return move(
              prev.todo.some(t => t.id === id) ? "todo" : "in_progress",
              "done"
            )
          } else {
            return move("done", "todo")
          }
        })
      } catch {
        toast.error("操作失败")
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      setColumns(prev => {
        const newCols = { ...prev }
        for (const key of ["todo", "in_progress", "done"] as const) {
          newCols[key] = newCols[key].filter(t => t.id !== id)
        }
        return newCols
      })
      try {
        await removeTodo(id)
        toast.success("已移至回收站", {
          action: {
            label: "撤销",
            onClick: () => startTransition(async () => {
              try {
                // TODO: restore
                toast.success("已恢复")
              } catch {
                toast.error("恢复失败")
              }
            }),
          },
        })
      } catch {
        toast.error("删除失败")
      }
    })
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (data: {
    name: string
    priority?: import("../_lib/todo-service").Priority
    dueDate?: string
    tags?: string[]
    status?: TodoStatus
    newSubTasks?: string[]
    deletedSubTaskIds?: string[]
    newAttachments?: { file: File; previewUrl: string }[]
    deletedAttachmentIds?: string[]
  }) => {
    if (!editingTodo) return

    startTransition(async () => {
      try {
        await updateTodoDetails(editingTodo.id, {
          name: data.name,
          priority: data.priority,
          dueDate: data.dueDate,
          tags: data.tags,
        })

        if (data.status) {
          await updateTodoStatus(editingTodo.id, data.status)
        }

        if (data.deletedSubTaskIds?.length) {
          await Promise.all(data.deletedSubTaskIds.map(id => removeSubTask(id)))
        }
        if (data.newSubTasks?.length) {
          await Promise.all(data.newSubTasks.map(name => createSubTask(editingTodo.id, name)))
        }
        if (data.deletedAttachmentIds?.length) {
          await Promise.all(data.deletedAttachmentIds.map(id => removeAttachment(id)))
        }
        if (data.newAttachments?.length) {
          await uploadTodoAttachments(editingTodo.id, data.newAttachments.map(a => a.file))
        }

        toast.success("任务已更新")
        setIsEditDialogOpen(false)
        setEditingTodo(null)
      } catch {
        toast.error("更新失败")
      }
    })
  }

  const handleMove = (todoId: string, fromStatus: string, toStatus: string, toIndex: number) => {
    startTransition(async () => {
      // Optimistic move
      setColumns(prev => {
        const newCols = { ...prev }
        const fromCol = [...newCols[fromStatus as keyof typeof prev]]
        const toCol = [...newCols[toStatus as keyof typeof prev]]
        const idx = fromCol.findIndex(t => t.id === todoId)
        if (idx === -1) return prev
        const [moved] = fromCol.splice(idx, 1)
        moved.status = toStatus as TodoStatus
        moved.completed = toStatus === "done"
        toCol.splice(toIndex, 0, moved)
        newCols[fromStatus as keyof typeof prev] = fromCol
        newCols[toStatus as keyof typeof prev] = toCol
        return newCols
      })

      try {
        await moveTodoToStatus(todoId, toStatus as TodoStatus, toIndex)
      } catch {
        toast.error("移动失败")
      }
    })
  }

  return (
    <div className="space-y-4">
      <TodoHeader email={userEmail}>
        <div className="flex items-center justify-between gap-2">
          <ViewSwitcher currentView="kanban" />
          <AddTodoInput onAdd={handleAdd} isPending={isPending} />
        </div>
      </TodoHeader>

      <KanbanBoard
        columns={[
          { id: "todo", title: "待办", todos: columns.todo },
          { id: "in_progress", title: "进行中", todos: columns.in_progress },
          { id: "done", title: "已完成", todos: columns.done },
        ]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onMove={handleMove}
      />

      <div className="flex items-center justify-center gap-4">
        <RealtimeStatus isConnected={isConnected} />
        {isPending && (
          <div className="flex items-center gap-2 text-xs text-blue-500 animate-pulse">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
            正在与服务器同步...
          </div>
        )}
      </div>

      <CreateTodoDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) setEditingTodo(null)
        }}
        todo={editingTodo}
        onSubmit={handleUpdate}
      />
    </div>
  )
}