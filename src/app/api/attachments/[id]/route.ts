import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { deleteAttachment, getAttachments } from '@/app/todos/_lib/todo-service';
import { revalidatePath } from 'next/cache';

async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
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
    const supabase = await createServerClient();

    // 注意：这里我们无法轻松验证附件所属权，但 RLS 会处理
    await deleteAttachment(id);
    revalidatePath('/todos');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/attachments/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
