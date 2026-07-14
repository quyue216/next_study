import { createServerClient } from "@/lib/supabase.server";

export type Priority = 'low' | 'medium' | 'high';

// 生成唯一文件名
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop() || '';
  // 清理文件名：移除中文、空格和特殊字符，只保留字母数字和连字符
  const sanitized = originalName
    .replace(/\.[^.]+$/, '') // 去掉扩展名
    .replace(/[^a-zA-Z0-9-]/g, '-') // 非字母数字的字符替换为连字符
    .replace(/-+/g, '-') // 合并连续连字符
    .replace(/^-|-$/g, '') // 去掉首尾连字符
    .slice(0, 50); // 限制长度
  return `${sanitized}-${timestamp}-${random}.${ext}`;
}

// 上传文件到 Supabase Storage
export async function uploadAttachment(
  userId: string,
  todoId: string,
  file: File
): Promise<{ fileName: string; fileUrl: string; fileSize: number; mimeType: string }> {
  const supabase = await createServerClient();

  const uniqueFileName = generateUniqueFileName(file.name);
  const filePath = `${userId}/${todoId}/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from('todo-attachments')
    .upload(filePath, file);

  if (uploadError) {
    console.error('[uploadAttachment] Error uploading file:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('todo-attachments')
    .getPublicUrl(filePath);

  return {
    fileName: file.name,
    fileUrl: publicUrl,
    fileSize: file.size,
    mimeType: file.type,
  };
}

// 创建待办事项并上传附件
export async function addTodoWithAttachments(
  userId: string,
  data: string | CreateTodoData,
  files: File[]
): Promise<Todo[]> {
  const supabase = await createServerClient();

  // 1. 准备主任务数据
  const todoData = typeof data === 'string'
    ? { name: data, completed: false, user_id: userId }
    : {
        name: data.name,
        completed: false,
        user_id: userId,
        priority: data.priority,
        due_date: data.dueDate,
        tags: data.tags
      };

  // 2. 提取子任务数据
  const subTasksNames = typeof data !== 'string' && data.subTasks ? data.subTasks.filter(name => name.trim()) : [];

  // 3. 创建主任务
  const { data: insertedTodo, error: insertError } = await supabase
    .from("todos")
    .insert(todoData)
    .select()
    .single();

  if (insertError || !insertedTodo) {
    console.error('[addTodoWithAttachments] Error inserting todo:', insertError);
    throw insertError;
  }

  try {
    // 4. 创建子任务（如果有）
    if (subTasksNames.length > 0) {
      const subTasksToInsert = subTasksNames.map(name => ({
        todo_id: insertedTodo.id,
        name: name.trim(),
        completed: false
      }));

      const { error: subTasksError } = await supabase
        .from("sub_tasks")
        .insert(subTasksToInsert);

      if (subTasksError) {
        console.error('[addTodoWithAttachments] Error inserting subtasks:', subTasksError);
        throw subTasksError;
      }
    }

    // 5. 上传附件（如果有）
    if (files.length > 0) {
      for (const file of files) {
        const attachmentData = await uploadAttachment(userId, insertedTodo.id, file);

        const { error: attachmentError } = await supabase
          .from("todo_attachments")
          .insert({
            todo_id: insertedTodo.id,
            file_name: attachmentData.fileName,
            file_url: attachmentData.fileUrl,
            file_size: attachmentData.fileSize,
            mime_type: attachmentData.mimeType,
          });

        if (attachmentError) {
          console.error('[addTodoWithAttachments] Error inserting attachment:', attachmentError);
          throw attachmentError;
        }
      }
    }
  } catch (error) {
    // 如果有任何失败，删除已创建的待办事项（会级联删除子任务和附件）
    await supabase.from("todos").delete().eq("id", insertedTodo.id);
    throw error;
  }

  return getTodos(userId);
}

export interface Todo {
  id: string
  name: string
  createdAt: string
  completed: boolean
  priority?: Priority
  dueDate?: string
  tags?: string[]
  attachments?: TodoAttachment[]
  subTasks?: SubTask[]
  sortOrder?: number
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
    dueDate: row.due_date ? String(row.due_date).substring(0, 10) : undefined,
    tags: row.tags as string[],
    sortOrder: row.sort_order as number,
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

export interface SearchFilters {
  search?: string
  completed?: boolean
  dueDateFrom?: string
  dueDateTo?: string
  tag?: string
}

export async function getTodosPaginated(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  filters?: SearchFilters
): Promise<PaginatedResult<Todo>> {
  const supabase = await createServerClient()

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("todos")
    .select(`
      *,
      todo_attachments (*),
      sub_tasks (*)
    `, { count: "exact" })
    .eq("user_id", userId)

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  if (filters?.completed !== undefined) {
    query = query.eq("completed", filters.completed)
  }

  if (filters?.dueDateFrom) {
    query = query.gte("due_date", filters.dueDateFrom)
  }

  if (filters?.dueDateTo) {
    query = query.lte("due_date", filters.dueDateTo)
  }

  if (filters?.tag) {
    query = query.contains("tags", [filters.tag])
  }

  const { data, error, count } = await query
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("[getTodosPaginated] Error:", error)
    throw error
  }

  const todos = (data ?? []).map(row => ({
    ...mapRow(row),
    attachments: row.todo_attachments ? row.todo_attachments.map(mapAttachmentRow) : [],
    subTasks: row.sub_tasks ? row.sub_tasks.map(mapSubTaskRow) : []
  }))

  const total = count ?? 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    data: todos,
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
  subTasks?: string[] // 子任务名称列表
}

export async function getNextSortOrder(userId: string): Promise<number> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("todos")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return 0
  return (data.sort_order ?? 0) + 1
}

export async function addTodo(userId: string, data: string | CreateTodoData): Promise<Todo[]> {
  const supabase = await createServerClient()
  const nextSortOrder = await getNextSortOrder(userId)

  // 1. 准备主任务数据
  const todoData = typeof data === 'string'
    ? { name: data, completed: false, user_id: userId, sort_order: nextSortOrder }
    : {
        name: data.name,
        completed: false,
        user_id: userId,
        priority: data.priority,
        due_date: data.dueDate,
        tags: data.tags,
        sort_order: nextSortOrder,
      }

  // 2. 提取子任务数据
  const subTasksNames = typeof data !== 'string' && data.subTasks ? data.subTasks.filter(name => name.trim()) : []

  // 3. 如果没有子任务，直接创建主任务
  if (subTasksNames.length === 0) {
    const { error } = await supabase
      .from("todos")
      .insert(todoData)

    if (error) {
      console.error("[addTodo] Error:", error)
      throw error
    }
    return getTodos(userId)
  }

  // 4. 有子任务时，使用事务创建
  // 注意：Supabase 客户端没有直接的事务 API，我们使用 RPC 或分步操作
  // 先创建主任务，获取 ID
  const { data: insertedTodo, error: insertError } = await supabase
    .from("todos")
    .insert(todoData)
    .select()
    .single()

  if (insertError || !insertedTodo) {
    console.error("[addTodo] Error inserting todo:", insertError)
    throw insertError
  }

  // 5. 创建子任务
  const subTasksToInsert = subTasksNames.map(name => ({
    todo_id: insertedTodo.id,
    name: name.trim(),
    completed: false
  }))

  const { error: subTasksError } = await supabase
    .from("sub_tasks")
    .insert(subTasksToInsert)

  if (subTasksError) {
    console.error("[addTodo] Error inserting subtasks:", subTasksError)
    // 如果子任务创建失败，尝试删除主任务（尽力回滚）
    await supabase.from("todos").delete().eq("id", insertedTodo.id)
    throw subTasksError
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

export async function deleteTodosByIds(userId: string, todoIds: string[]): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("user_id", userId)
    .in("id", todoIds)

  if (error) throw error
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
  // 先查询附件信息（所属待办ID和文件URL）
  const { data: attachmentData, error: getError } = await supabase
    .from("todo_attachments")
    .select("todo_id, file_url")
    .eq("id", attachmentId)
    .single()

  if (getError) throw getError

  // 从公开URL中提取存储路径，删除Storage中的文件
  if (attachmentData.file_url) {
    try {
      const url = new URL(attachmentData.file_url)
      // Supabase公开URL格式: /storage/v1/object/public/<bucket>/<path>
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/todo-attachments\/(.+)/)
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1])
        await supabase.storage.from('todo-attachments').remove([filePath])
      }
    } catch (err) {
      // 删除存储文件失败不阻塞DB删除，记录日志即可
      console.error('[deleteAttachment] Error removing file from storage:', err)
    }
  }

  const { error } = await supabase
    .from("todo_attachments")
    .delete() // 删除附件记录
    .eq("id", attachmentId)

  if (error) throw error
  return getAttachments(attachmentData.todo_id)
}
