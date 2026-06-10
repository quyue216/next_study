import { TodosContainer } from "./_components/todos-container"
import { getTodos } from "./_lib/todo-service"

export default async function Todos() {
  const todos = await getTodos()

  return (
    <div className="mx-auto min-w-3xl p-8">
      <TodosContainer initialTodos={todos} />
    </div>
  )
}
