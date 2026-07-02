# Todo Management API Guide

## Overview

The Todo API has been extended to support:
- Priority management (low/medium/high)
- Due dates with reminders
- Tag/category system with filtering
- File attachments (via Supabase Storage)
- Subtasks with progress tracking

## Database Migration

Run the SQL migration in `supabase/migrations/todo_extensions.sql` to update your database schema.

### Required Storage Setup

Create a storage bucket named `todo-attachments` in your Supabase project with these RLS policies:

```sql
-- Policy 1: Users can upload their own files
CREATE POLICY "Users can upload to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'todo-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy 2: Users can read their own files
CREATE POLICY "Users can read their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'todo-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy 3: Users can delete their own files
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'todo-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## API Endpoints

### Todos

#### `GET /api/todos`
Get paginated todos with optional filters
- Query params:
  - `page` (default: 1)
  - `pageSize` (default: 10)
  - `search` - search by name
  - `filterTag` - filter by tag
  - `action=tags` - get all user tags
  - `action=byTag&tag=...` - get todos by tag

#### `POST /api/todos`
Create a new todo
- Body: `{ name, priority?, dueDate?, tags? }`

#### `PATCH /api/todos/[id]`
Update a todo
- Body: `{ name?, completed?, priority?, dueDate?, tags? }`

#### `DELETE /api/todos/[id]`
Delete a todo

### Subtasks

#### `GET /api/todos/[todoId]/subtasks`
Get subtasks for a todo
- Query params: `action=progress` - get completion progress

#### `POST /api/todos/[todoId]/subtasks`
Create a subtask
- Body: `{ name }`

#### `PATCH /api/todos/subtasks/[subtaskId]`
Update a subtask
- Body: `{ name?, completed? }`

#### `DELETE /api/todos/subtasks/[subtaskId]`
Delete a subtask

### Attachments

#### `GET /api/todos/[todoId]/attachments`
Get attachments for a todo

#### `POST /api/todos/[todoId]/attachments`
Upload an attachment
- Content-Type: `multipart/form-data`
- Field: `file`

#### `DELETE /api/todos/attachments/[attachmentId]`
Delete an attachment

## Server Actions

For server-side usage, use the actions from `todos/actions.ts`:
- `createTodoWithDetails()`
- `updateTodoDetails()`
- `createSubTask()`
- `updateSubTaskState()`
- `removeSubTask()`

## Types

All types are defined in `todos/_lib/todo-service.ts`:
- `Todo` - extended todo with priority, dueDate, tags
- `SubTask` - subtask type
- `TodoAttachment` - attachment type
- `Priority` - 'low' | 'medium' | 'high'
