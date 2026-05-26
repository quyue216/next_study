import { TodoHeader } from "./_components/todo-header"
import { TodoList } from "./_components/todo-list"
import { TodoFooter } from "./_components/todo-footer"
import { AddTodoInput } from "./_components/add-todo-input"
import { getTodos } from "./_lib/todo-service"
import { createTodo } from "./actions"

export default async function Todos() {
  const todos = await getTodos()

  return (
    <div className="mx-auto max-w-2xl p-8">
      <TodoHeader>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Form Action — 回车/提交后列表自动刷新</p>
            <form action={createTodo} className="mt-1">
              <input
                name="name"
                type="text"
                placeholder="请添加任务"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </form>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Client onClick — 点击后列表不会自动刷新</p>
            <AddTodoInput />
          </div>
        </div>
      </TodoHeader>
      <TodoList todos={todos} />
      <TodoFooter todos={todos} />
    </div>
  )
}
