"use server"

import { createServerClient } from "@/lib/supabase.server";
import {
  addTodo,
  setTodoCompleted,
  setAllTodoCompleted,
  deleteTodo,
  clearTodos,
  deleteTodosByIds,
  updateTodo,
  Priority,
  CreateTodoData,
  addSubTask,
  updateSubTask,
  deleteSubTask,
  addTodoWithAttachments,
  deleteAttachment,
  uploadAttachment,
  addAttachment,
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

export async function createTodoWithDetails(data: CreateTodoData) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!data.name?.trim()) return;

  await addTodo(user.id, data);
  revalidatePath("/todos"); //强制props更新
}

// 新增：带子任务的创建函数（前端可以调用这个）
export async function createTodoWithSubTasks(data: CreateTodoData & { subTasks?: string[] }) {
  const user = await getCurrentUser();
  if (!user) return;
  if (!data.name?.trim()) return;

  await addTodo(user.id, data);
  revalidatePath("/todos");
}

export async function toggleTodoState(id: string, completed: boolean) {
  const user = await getCurrentUser();
  if (!user || !id) return;

  await setTodoCompleted(user.id, id, completed);
  revalidatePath("/todos");
}

export async function updateTodoDetails(
  id: string,
  updates: {
    name?: string
    priority?: Priority
    dueDate?: string
    tags?: string[]
  }
) {
  const user = await getCurrentUser();
  if (!user || !id) return;

  await updateTodo(user.id, id, updates);
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

export async function removeSelectedTodos(todoIds: string[]) {
  const user = await getCurrentUser();
  if (!user || todoIds.length === 0) return;

  await deleteTodosByIds(user.id, todoIds);
  revalidatePath("/todos");
}

// ========== SubTasks ==========
export async function createSubTask(todoId: string, name: string) {
  const user = await getCurrentUser();
  if (!user || !todoId || !name?.trim()) return;

  await addSubTask(todoId, name.trim());
  revalidatePath("/todos");
}

export async function updateSubTaskState(subTaskId: string, name?: string, completed?: boolean) {
  const user = await getCurrentUser();
  if (!user || !subTaskId) return;

  await updateSubTask(subTaskId, { name, completed });
  revalidatePath("/todos");
}

export async function removeSubTask(subTaskId: string) {
  const user = await getCurrentUser();
  if (!user || !subTaskId) return;

  await deleteSubTask(subTaskId);
  revalidatePath("/todos");
}

// 创建待办事项并上传附件
export async function createTodoWithDetailsAndAttachments(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const name = formData.get('name') as string;
  if (!name?.trim()) return;

  const priority = formData.get('priority') as Priority | null;
  const dueDate = formData.get('dueDate') as string | null;
  const tagsString = formData.get('tags') as string | null;
  const subTasksString = formData.get('subTasks') as string | null;

  const tags = tagsString ? JSON.parse(tagsString) as string[] : undefined;
  const subTasks = subTasksString ? JSON.parse(subTasksString) as string[] : undefined;

  const files: File[] = [];
  const fileEntries = formData.getAll('files');
  for (const entry of fileEntries) {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  }

  await addTodoWithAttachments(user.id, {
    name: name.trim(),
    priority: priority || undefined,
    dueDate: dueDate || undefined,
    tags,
    subTasks,
  }, files);
  revalidatePath("/todos");
}

export async function removeAttachment(attachmentId: string) {
  const user = await getCurrentUser();
  if (!user || !attachmentId) return;

  await deleteAttachment(attachmentId);
  revalidatePath("/todos");
}

export async function uploadTodoAttachments(todoId: string, files: File[]) {
  const user = await getCurrentUser();
  if (!user || !todoId || files.length === 0) return;

  for (const file of files) {
    const attachmentData = await uploadAttachment(user.id, todoId, file);
    await addAttachment(
      todoId,
      attachmentData.fileName,
      attachmentData.fileUrl,
      attachmentData.fileSize,
      attachmentData.mimeType
    );
  }
  revalidatePath("/todos");
}

