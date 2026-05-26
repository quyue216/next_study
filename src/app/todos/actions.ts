"use server"

import { addTodo } from "./_lib/todo-service"
import { revalidatePath } from "next/cache"

export async function createTodo(formData: FormData) {
  const name = formData.get("name") as string
  if (!name?.trim()) return
  await addTodo(name.trim())
  revalidatePath("/todos")
}

export async function createTodoClient(name: string) {
  if (!name?.trim()) return
  await addTodo(name.trim())
  revalidatePath("/todos")
}
