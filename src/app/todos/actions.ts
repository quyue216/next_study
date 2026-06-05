"use server"

import { addTodo, setTodoCompleted, setAllTodoCompleted, deleteTodo, clearTodos } from "./_lib/todo-service"
import { revalidatePath } from "next/cache"

export async function createTodo(formData: FormData) {
  console.log("[createTodo] Called with:", Object.fromEntries(formData))
  const name = formData.get("name") as string
  if (!name?.trim()) {
    console.log("[createTodo] Empty name, returning")
    return
  }
  await addTodo(name.trim())
  console.log("[createTodo] Revalidating /todos")
  revalidatePath("/todos")
}
//方法 命名标识给客户端使用还是服务端
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

export async function removeTodo(id: string) {
  if (!id) return
  await deleteTodo(id)
  revalidatePath('/todos')
}

export async function removeAllTodos() {
  await clearTodos()
  revalidatePath('/todos')
}

