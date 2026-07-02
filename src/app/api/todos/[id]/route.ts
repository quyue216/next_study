import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase.server'
import { updateTodo, deleteTodo, getTodoById, Priority } from '@/app/todos/_lib/todo-service'
import { revalidatePath } from 'next/cache'

async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, completed, priority, dueDate, tags } = body

    const todo = await getTodoById(user.id, id)
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await updateTodo(user.id, id, {
      name,
      completed,
      priority: priority as Priority,
      dueDate,
      tags
    })

    revalidatePath('/todos')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PATCH /api/todos/[id]] Error:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const todo = await getTodoById(user.id, id)
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await deleteTodo(user.id, id)
    revalidatePath('/todos')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/todos/[id]] Error:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
