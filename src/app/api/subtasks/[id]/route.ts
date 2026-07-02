import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { updateSubTask, deleteSubTask } from '@/app/todos/_lib/todo-service';
import { revalidatePath } from 'next/cache';

async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, completed } = body;

    await updateSubTask(id, { name, completed });
    revalidatePath('/todos');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/subtasks/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update subtask' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await deleteSubTask(id);
    revalidatePath('/todos');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/subtasks/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete subtask' }, { status: 500 });
  }
}
