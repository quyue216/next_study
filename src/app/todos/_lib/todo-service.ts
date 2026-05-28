import { supabase } from "@/lib/supabase"

export interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

function mapRow(row: any): Todo {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    completed: row.completed,
  }
}

export async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapRow)
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return undefined
  return mapRow(data)
}

export async function addTodo(name: string): Promise<Todo[]> {
  const { error } = await supabase
    .from("todos")
    .insert({ name, completed: false })

  if (error) throw error
  return getTodos()
}

export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "completed">>
): Promise<Todo[]> {
  const payload: Record<string, any> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.completed !== undefined) payload.completed = updates.completed

  const { error } = await supabase.from("todos").update(payload).eq("id", id)

  if (error) throw error
  return getTodos()
}

export async function deleteTodo(id: string): Promise<Todo[]> {
  const { error } = await supabase.from("todos").delete().eq("id", id)

  if (error) throw error
  return getTodos()
}

export async function toggleTodo(id: string): Promise<Todo[]> {
  const todo = await getTodoById(id)
  if (!todo) return getTodos()

  const { error } = await supabase
    .from("todos")
    .update({ completed: !todo.completed })
    .eq("id", id)

  if (error) throw error
  return getTodos()
}

export async function setTodoCompleted(
  id: string,
  completed: boolean
): Promise<Todo[]> {
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)

  if (error) throw error
  return getTodos()
}

export async function setAllTodoCompleted(
  completed: boolean
): Promise<Todo[]> {
  const todos = await getTodos()
  for (const todo of todos) {
    const { error } = await supabase
      .from("todos")
      .update({ completed })
      .eq("id", todo.id)
    if (error) throw error
  }
  return getTodos()
}
