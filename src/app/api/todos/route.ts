import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase.server'
import {
  getTodosPaginated,
  getTodosByTag,
  getTagsByUser,
  CreateTodoData,
  addTodo,
  Todo,
  updateTodo,
  deleteTodo,
  Priority
} from '@/app/todos/_lib/todo-service'
import { revalidatePath } from 'next/cache'

async function getCurrentUser(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')

  try {
    if (action === 'tags') {  //C端用户自定义标签，每个用户标签都不大相同
      const tags = await getTagsByUser(user.id)
      return NextResponse.json({ tags })
    }

    if (action === 'byTag') {
      const tag = searchParams.get('tag')
      if (!tag) {
        return NextResponse.json({ error: 'Tag is required' }, { status: 400 })
      }
      const todos = await getTodosByTag(user.id, tag)
      return NextResponse.json({ todos })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || undefined
    const completed = searchParams.get('completed')
    const dueDateFrom = searchParams.get('dueDateFrom') || undefined
    const dueDateTo = searchParams.get('dueDateTo') || undefined
    const tag = searchParams.get('tag') || undefined

    const filters = {
      search,
      completed: completed !== null ? completed === 'true' : undefined,
      dueDateFrom,
      dueDateTo,
      tag,
    }

    const result = await getTodosPaginated(user.id, page, pageSize, filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/todos] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, priority, dueDate, tags, subTasks } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const todoData: CreateTodoData = {
      name: name.trim(),
      priority: priority as Priority,
      dueDate,
      tags,
      subTasks: Array.isArray(subTasks) ? subTasks : undefined
    }

    await addTodo(user.id, todoData)
    revalidatePath('/todos')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/todos] Error:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}
