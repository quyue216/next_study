import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase.server";
import { TodosWrapper } from "./_components/todos-wrapper";
import { getTodosPaginated, getTagsByUser, type PaginatedResult, type Todo } from "./_lib/todo-service";

interface PageProps {
  searchParams?: Promise<{
    page?: string
    pageSize?: string
    search?: string
    completed?: string
    dueDateFrom?: string
    dueDateTo?: string
    tag?: string
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

  const filters = {
    search: params?.search || undefined,
    completed: params?.completed !== undefined ? params.completed === 'true' : undefined,
    dueDateFrom: params?.dueDateFrom || undefined,
    dueDateTo: params?.dueDateTo || undefined,
    tag: params?.tag || undefined,
  }

  const paginatedTodos = await getTodosPaginated(data.user.id, page, pageSize, filters);
  const allTags = await getTagsByUser(data.user.id);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <TodosWrapper
        initialTodos={paginatedTodos.data}
        userEmail={data.user.email}
        filters={filters}
        allTags={allTags}
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
