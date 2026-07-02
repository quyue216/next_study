import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import {
  getSubTasks,
  addSubTask,
  getTodoById
} from '@/app/todos/_lib/todo-service';
import { revalidatePath } from 'next/cache';

async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todo = await getTodoById(user.id, id);
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'progress') {
      const subTasks = await getSubTasks(id);
      const total = subTasks.length;
      const completed = subTasks.filter(t => t.completed).length;
      return NextResponse.json({ total, completed });
    }

    const subTasks = await getSubTasks(id);
    return NextResponse.json({ subTasks });
  } catch (error) {
    console.error('[GET /api/todos/[id]/subtasks] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch subtasks' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const todo = await getTodoById(user.id, id);
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await addSubTask(id, name.trim());
    revalidatePath('/todos');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/todos/[id]/subtasks] Error:', error);
    return NextResponse.json({ error: 'Failed to create subtask' }, { status: 500 });
  }
}
