import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import {
  getAttachments,
  addAttachment,
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

    const attachments = await getAttachments(id);
    return NextResponse.json({ attachments });
  } catch (error) {
    console.error('[GET /api/todos/[id]/attachments] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${id}/${Date.now()}.${fileExt}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('todo-attachments')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('todo-attachments')
      .getPublicUrl(uploadData.path);

    await addAttachment(id, file.name, publicUrl, file.size, file.type);

    revalidatePath('/todos');
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('[POST /api/todos/[id]/attachments] Error:', error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}
