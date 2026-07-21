import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase.server";
import { getDeletedTodosPaginated } from "../_lib/todo-service";
import { TrashContainer } from "./_components/trash-container";

interface PageProps {
  searchParams?: Promise<{
    page?: string
    pageSize?: string
  }>
}

export default async function TrashPage({ searchParams }: PageProps) {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = params?.page ? parseInt(params.page, 10) : 1;
  const pageSize = params?.pageSize ? parseInt(params.pageSize, 10) : 10;

  const result = await getDeletedTodosPaginated(data.user.id, page, pageSize);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <TrashContainer
        deletedTodos={result.data}
        userEmail={data.user.email}
        pagination={{
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        }}
      />
    </div>
  );
}