"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { TodosContainer } from "./todos-container"
import { TodoListLoading } from "./todo-list-loading"
import { type Todo, type PaginatedResult } from "../_lib/todo-service"

interface TodosWrapperProps {
  initialTodos: Todo[]
  userEmail?: string
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export function TodosWrapper({ initialTodos, userEmail, pagination: initialPagination }: TodosWrapperProps) {
  const searchParams = useSearchParams()
  console.log("🚀 ~ TodosWrapper ~ searchParams:", searchParams)
  const [isLoading, setIsLoading] = useState(false)
  const [prevKey, setPrevKey] = useState("")

  // 当 URL 参数变化时，显示 loading 状态
  const currentKey = `${searchParams.get("page")}-${searchParams.get("pageSize")}`

  useEffect(() => {
    if (prevKey && prevKey !== currentKey) {
      setIsLoading(true)
      // 模拟 loading 延迟，实际项目中这个时间会被真实数据加载占用
      const timer = setTimeout(() => setIsLoading(false), 0)
      return () => clearTimeout(timer)
    }
    setPrevKey(currentKey)
  }, [currentKey, prevKey])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12" /> {/* Placeholder for header */}
        <TodoListLoading />
        <div className="h-24" /> {/* Placeholder for footer and pagination */}
      </div>
    )
  }

  return (
    <TodosContainer
      initialTodos={initialTodos}
      userEmail={userEmail}
      pagination={initialPagination}
    />
  )
}
