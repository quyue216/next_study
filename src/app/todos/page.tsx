import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase.server";
import { TodosContainer } from "./_components/todos-container";
import { getTodos } from "./_lib/todo-service";

export default async function Todos() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const todos = await getTodos(data.user.id);

  return (
    <div className="mx-auto min-w-3xl p-8">
      <TodosContainer initialTodos={todos} userEmail={data.user.email} />
    </div>
  );
}
