import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase.server";
import { TodosContainer } from "./_components/todos-container";
import { getTodosPaginated, type PaginatedResult, type Todo } from "./_lib/todo-service";

interface PageProps {
  searchParams?: Promise<{
    page?: string
    pageSize?: string
  }>
}

export default async function Todos({ searchParams }: PageProps) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const params = await searchParams
  const page = params?.page ? parseInt(params.page, 10) : 1
  const pageSize = params?.pageSize ? parseInt(params.pageSize, 10) : 10

  const paginatedTodos = await getTodosPaginated(data.user.id, page, pageSize);

  return (
    <div className="mx-auto min-w-3xl p-8">
      <TodosContainer
        initialTodos={paginatedTodos.data}
        userEmail={data.user.email}
        pagination={{
          total: paginatedTodos.total,
          page: paginatedTodos.page,
          pageSize: paginatedTodos.pageSize,
          totalPages: paginatedTodos.totalPages,
        }}
      />
    </div>
  );
}
