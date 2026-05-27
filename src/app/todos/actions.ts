"use server"

import { addTodo ,setTodoCompleted,setAllTodoCompleted} from "./_lib/todo-service"
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


export async function toggleTodoState(id: string, completed: boolean) {
  if (!id) return;
  await setTodoCompleted(id,completed)
  revalidatePath('/todos')
}

export async function setAllTodosCompleted(completed: boolean) {
  await setAllTodoCompleted(completed)
  revalidatePath('/todos')
}