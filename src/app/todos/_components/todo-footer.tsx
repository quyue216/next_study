interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

interface TodoFooterProps {
  todos: Todo[]
}

export function TodoFooter({ todos }: TodoFooterProps) {
  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const pending = total - completed

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>共 {total} 项任务</span>
      <div className="flex gap-4">
        <span>已完成: {completed}</span>
        <span>待完成: {pending}</span>
      </div>
    </div>
  )
}
