import { TodoHeader } from "./_components/todo-header"
import { TodoList } from "./_components/todo-list"
import { TodoFooter } from "./_components/todo-footer"
import { getTodos } from "./_lib/todo-service"
import { createTodo } from "./actions"

export default async function Todos() {
  const todos = await getTodos()

  return (
    <div className="mx-auto max-w-2xl p-8">
      <TodoHeader>
        <form action={createTodo} className="mt-3">
          <input
            name="name"
            type="text"
            placeholder="请添加任务"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </form>
      </TodoHeader>
      <TodoList todos={todos} />
      <TodoFooter todos={todos} />
    </div>
  )
}
