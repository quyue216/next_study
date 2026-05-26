import { readFile, writeFile } from "fs/promises"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "src/app/todos/data.json")

export interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
}

async function readData(): Promise<Todo[]> {
  const raw = await readFile(DATA_PATH, "utf-8")
  return JSON.parse(raw)
}

async function writeData(todos: Todo[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(todos, null, 2) + "\n")
}

export async function getTodos(): Promise<Todo[]> {
  return readData()
}

export async function getTodoById(id: string): Promise<Todo | undefined> {
  const todos = await readData()
  return todos.find((t) => t.id === id)
}

export async function addTodo(name: string): Promise<Todo[]> {
  const todos = await readData()
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    completed: false,
  }
  const updated = [...todos, newTodo]
  await writeData(updated)
  return updated
}

export async function updateTodo(
  id: string,
  updates: Partial<Pick<Todo, "name" | "completed">>
): Promise<Todo[]> {
  const todos = await readData()
  const updated = todos.map((t) => (t.id === id ? { ...t, ...updates } : t))
  await writeData(updated)
  return updated
}

export async function deleteTodo(id: string): Promise<Todo[]> {
  const todos = await readData()
  const updated = todos.filter((t) => t.id !== id)
  await writeData(updated)
  return updated
}

export async function toggleTodo(id: string): Promise<Todo[]> {
  const todos = await readData()
  const updated = todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
  await writeData(updated)
  return updated
}
