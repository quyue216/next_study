"use server"

import { createServerClient } from "@/lib/supabase.server";
import {
  addTodo,
  setTodoCompleted,
  setAllTodoCompleted,
  deleteTodo,
  clearTodos,
} from "./_lib/todo-service";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function createTodo(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const name = formData.get("name") as string;
  if (!name?.trim()) return;

  await addTodo(user.id, name.trim());
  revalidatePath("/todos");
}

export async function createTodoClient(name: string) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!name?.trim()) return;

  await addTodo(user.id, name.trim());
  revalidatePath("/todos");
}

export async function toggleTodoState(id: string, completed: boolean) {
  const user = await getCurrentUser();
  if (!user || !id) return;

  await setTodoCompleted(user.id, id, completed);
  revalidatePath("/todos");
}

export async function setAllTodosCompleted(completed: boolean) {
  const user = await getCurrentUser();
  if (!user) return;

  await setAllTodoCompleted(user.id, completed);
  revalidatePath("/todos");
}

export async function removeTodo(id: string) {
  const user = await getCurrentUser();
  if (!user || !id) return;

  await deleteTodo(user.id, id);
  revalidatePath("/todos");
}

export async function removeAllTodos() {
  const user = await getCurrentUser();
  if (!user) return;

  await clearTodos(user.id);
  revalidatePath("/todos");
}
