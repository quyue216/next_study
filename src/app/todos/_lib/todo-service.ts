import { createServerClient } from "@/lib/supabase.server";

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
  priority?: Priority //优先级
  dueDate?: string //到期日
  tags?: string[] //标签
}

export interface SubTask {
  id: string
  todoId: string
  name: string
  completed: boolean
  createdAt: string
}

export interface TodoAttachment {
  id: string
  todoId: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string //是用来标识文件类型的标准格式
  createdAt: string
}

function mapRow(row: Record<string, unknown>): Todo {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    completed: row.completed,
    priority: row.priority as Priority,
    dueDate: row.due_date,
    tags: row.tags as string[],
  }
}

function mapSubTaskRow(row: Record<string, unknown>): SubTask {
  return {
    id: row.id,
    todoId: row.todo_id,
    name: row.name,
    completed: row.completed,
    createdAt: row.created_at,
  }
}

function mapAttachmentRow(row: Record<string, unknown>): TodoAttachment {
  return {
    id: row.id,
    todoId: row.todo_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    createdAt: row.created_at,
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

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getTodosPaginated(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string
): Promise<PaginatedResult<Todo>> {
  const supabase = await createServerClient()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("todos")
    .select("*", { count: "exact" })
    .eq("user_id", userId)

  if (search) {
    query = query.ilike("name", `%${search}%`)
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("[getTodosPaginated] Error:", error)
    throw error
  }

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: (data ?? []).map(mapRow),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getTodosCount(userId: string): Promise<number> {
  const supabase = await createServerClient()
  const { count, error } = await supabase
    .from("todos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) {
    console.error("[getTodosCount] Error:", error)
    throw error
  }

  return count ?? 0
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

export interface CreateTodoData {
  name: string
  priority?: Priority
  dueDate?: string
  tags?: string[]
}

export async function addTodo(userId: string, data: string | CreateTodoData): Promise<Todo[]> {
  const supabase = await createServerClient()
  const todoData = typeof data === 'string'
    ? { name: data, completed: false, user_id: userId }
    : {
        name: data.name,
        completed: false,
        user_id: userId,
        priority: data.priority,
        due_date: data.dueDate,
        tags: data.tags
      }

  const { error } = await supabase
    .from("todos")
    .insert(todoData)

  if (error) {
    console.error("[addTodo] Error:", error)
    throw error
  }
  return getTodos(userId)
}

export async function updateTodo(
  userId: string,
  id: string,
  updates: Partial<Pick<Todo, "name" | "completed" | "priority" | "dueDate" | "tags">>
): Promise<Todo[]> {
  const payload: Record<string, string | boolean | Priority | string[] | undefined> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.completed !== undefined) payload.completed = updates.completed
  if (updates.priority !== undefined) payload.priority = updates.priority
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate
  if (updates.tags !== undefined) payload.tags = updates.tags

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

// ========== 标签相关 ==========
export async function getTagsByUser(userId: string): Promise<string[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("todos")
    .select("tags")
    .eq("user_id", userId)
    .not("tags", "is", null) // 过滤掉没有标签的待办

  if (error) throw error

  const allTags = new Set<string>()
  data.forEach(row => {
    if (Array.isArray(row.tags)) {
      row.tags.forEach(tag => allTags.add(tag)) // 收集所有标签并去重
    }
  })
  return Array.from(allTags)
}

export async function getTodosByTag(userId: string, tag: string): Promise<Todo[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .contains("tags", [tag]) // 只返回包含指定标签的待办
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapRow)
}

// ========== 子任务相关 ==========
export async function getSubTasks(todoId: string): Promise<SubTask[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("sub_tasks")
    .select("*")
    .eq("todo_id", todoId) // 查询指定待办的子任务
    .order("created_at", { ascending: true }) // 按创建时间正序排列

  if (error) throw error
  return (data ?? []).map(mapSubTaskRow)
}

export async function addSubTask(todoId: string, name: string): Promise<SubTask[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("sub_tasks")
    .insert({ todo_id: todoId, name, completed: false }) // 创建未完成的子任务

  if (error) throw error
  return getSubTasks(todoId)
}

export async function updateSubTask(subTaskId: string, updates: Partial<Pick<SubTask, "name" | "completed">>): Promise<SubTask[]> {
  const supabase = await createServerClient()
  // 先查询子任务所属的待办ID
  const { data: subTaskData, error: getError } = await supabase
    .from("sub_tasks")
    .select("todo_id")
    .eq("id", subTaskId)
    .single()

  if (getError) throw getError

  const { error } = await supabase
    .from("sub_tasks")
    .update(updates) // 更新子任务
    .eq("id", subTaskId)

  if (error) throw error
  return getSubTasks(subTaskData.todo_id)
}

export async function deleteSubTask(subTaskId: string): Promise<SubTask[]> {
  const supabase = await createServerClient()
  // 先查询子任务所属的待办ID
  const { data: subTaskData, error: getError } = await supabase
    .from("sub_tasks")
    .select("todo_id")
    .eq("id", subTaskId)
    .single()

  if (getError) throw getError

  const { error } = await supabase
    .from("sub_tasks")
    .delete() // 删除子任务
    .eq("id", subTaskId)

  if (error) throw error
  return getSubTasks(subTaskData.todo_id)
}

export async function getSubTaskProgress(todoId: string): Promise<{ total: number; completed: number }> {
  const subTasks = await getSubTasks(todoId)
  const completed = subTasks.filter(t => t.completed).length // 统计已完成数量
  return { total: subTasks.length, completed }
}

// ========== 附件相关 ==========
export async function getAttachments(todoId: string): Promise<TodoAttachment[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("todo_attachments")
    .select("*")
    .eq("todo_id", todoId) // 查询指定待办的附件
    .order("created_at", { ascending: false }) // 最新的在前

  if (error) throw error
  return (data ?? []).map(mapAttachmentRow)
}

export async function addAttachment(
  todoId: string,
  fileName: string,
  fileUrl: string,
  fileSize: number,
  mimeType: string
): Promise<TodoAttachment[]> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todo_attachments")
    .insert({ todo_id: todoId, file_name: fileName, file_url: fileUrl, file_size: fileSize, mime_type: mimeType })

  if (error) throw error
  return getAttachments(todoId)
}

export async function deleteAttachment(attachmentId: string): Promise<TodoAttachment[]> {
  const supabase = await createServerClient()
  // 先查询附件所属的待办ID
  const { data: attachmentData, error: getError } = await supabase
    .from("todo_attachments")
    .select("todo_id")
    .eq("id", attachmentId)
    .single()

  if (getError) throw getError

  const { error } = await supabase
    .from("todo_attachments")
    .delete() // 删除附件记录
    .eq("id", attachmentId)

  if (error) throw error
  return getAttachments(attachmentData.todo_id)
}
