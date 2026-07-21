"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Todo } from "./todo-service"

interface UseRealtimeTodosOptions {
  userId: string
  onRemoteChange: (event: {
    type: "INSERT" | "UPDATE" | "DELETE"
    todo: Todo | null
    oldRecord?: Record<string, unknown>
  }) => void
}

export function useRealtimeTodos({ userId, onRemoteChange }: UseRealtimeTodosOptions) {
  const pendingMutationIds = useRef<Set<string>>(new Set())
  const [isConnected, setIsConnected] = useState(false)
  const onRemoteChangeRef = useRef(onRemoteChange)

  // 保持回调引用最新，避免 Effect 依赖变化导致无限循环
  onRemoteChangeRef.current = onRemoteChange

  const markPending = (id: string) => {
    pendingMutationIds.current.add(id)
    setTimeout(() => pendingMutationIds.current.delete(id), 5000)
  }

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("todos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          // Skip our own changes (optimistic updates already handled)
          const newId = (newRecord as Record<string, unknown>)?.id
          if (newId && pendingMutationIds.current.has(newId as string)) {
            return
          }

          if (eventType === "DELETE") {
            onRemoteChangeRef.current({
              type: "DELETE",
              todo: null,
              oldRecord: oldRecord as Record<string, unknown>,
            })
          } else {
            onRemoteChangeRef.current({
              type: eventType as "INSERT" | "UPDATE",
              todo: mapRealtimeRow(newRecord as Record<string, unknown>),
            })
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId]) // 不再依赖 onRemoteChange，通过 ref 访问最新回调

  return { markPending, isConnected }
}

function mapRealtimeRow(row: Record<string, unknown>): Todo {
  return {
    id: row.id as string,
    name: row.name as string,
    createdAt: row.created_at as string,
    completed: (row.status === "done") || (row.completed as boolean),
    priority: row.priority as Todo["priority"],
    dueDate: row.due_date ? String(row.due_date).substring(0, 10) : undefined,
    tags: row.tags as string[],
    sortOrder: row.sort_order as number,
    status: row.status as Todo["status"],
    deletedAt: row.deleted_at ? String(row.deleted_at) : undefined,
  }
}