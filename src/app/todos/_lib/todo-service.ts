import { createServerClient } from "@/lib/supabase.server";

export interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

function mapRow(row: Record<string, unknown>): Todo {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    completed: row.completed,
  }
}

export async function getTodos(userId: string): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getTodos] Error:", error)
    throw error
  }
  return (data ?? []).map(mapRow)
}

export async function getTodoById(userId: string, id: string): Promise<Todo | undefined> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single()

  if (error || !data) return undefined
  return mapRow(data)
}

export async function addTodo(userId: string, name: string): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .insert({ name, completed: false, user_id: userId })

  if (error) {
    console.error("[addTodo] Error:", error)
    throw error
  }
  return getTodos(userId)
}

export async function updateTodo(
  userId: string,
  id: string,
  updates: Partial<Pick<Todo, "name" | "completed">>
): Promise<Todo[]> {
  const payload: Record<string, string | boolean | undefined> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.completed !== undefined) payload.completed = updates.completed

  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
  return getTodos(userId)
}

export async function deleteTodo(userId: string, id: string): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
  return getTodos(userId)
}

export async function toggleTodo(userId: string, id: string): Promise<Todo[]> {
  const todo = await getTodoById(userId, id)
  if (!todo) return getTodos(userId)

  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .update({ completed: !todo.completed })
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
  return getTodos(userId)
}

export async function setTodoCompleted(
  userId: string,
  id: string,
  completed: boolean
): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw error
  return getTodos(userId)
}

export async function setAllTodoCompleted(
  userId: string,
  completed: boolean
): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("user_id", userId)

  if (error) throw error
  return getTodos(userId)
}

export async function clearTodos(userId: string): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("user_id", userId)

  if (error) throw error
  return getTodos(userId)
}
