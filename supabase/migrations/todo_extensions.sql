-- =======================================
-- Extend todos table with new features
-- =======================================

-- Add priority, due_date, and tags columns to todos table
ALTER TABLE todos
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS due_date timestamptz,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- =======================================
-- Subtasks table
-- =======================================

CREATE TABLE IF NOT EXISTS sub_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id uuid NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  name text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on sub_tasks
ALTER TABLE sub_tasks ENABLE ROW LEVEL SECURITY;

-- Subtasks policies - inherit from todos' user_id
CREATE POLICY "Users can view their subtasks"
  ON sub_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = sub_tasks.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their subtasks"
  ON sub_tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = sub_tasks.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their subtasks"
  ON sub_tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = sub_tasks.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their subtasks"
  ON sub_tasks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = sub_tasks.todo_id AND todos.user_id = auth.uid()
  ));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sub_tasks_todo_id ON sub_tasks(todo_id);

-- =======================================
-- Todo attachments table
-- =======================================

CREATE TABLE IF NOT EXISTS todo_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id uuid NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on todo_attachments
ALTER TABLE todo_attachments ENABLE ROW LEVEL SECURITY;

-- Attachments policies
CREATE POLICY "Users can view their attachments"
  ON todo_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = todo_attachments.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their attachments"
  ON todo_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = todo_attachments.todo_id AND todos.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their attachments"
  ON todo_attachments FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM todos WHERE todos.id = todo_attachments.todo_id AND todos.user_id = auth.uid()
  ));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_todo_attachments_todo_id ON todo_attachments(todo_id);

-- =======================================
-- Storage bucket for attachments
-- =======================================

-- Note: If you're running this manually, you need to create the bucket
-- through Supabase dashboard or use the Storage API
--
-- The bucket should:
-- - Be named "todo-attachments"
-- - Be private (not public)
-- - Have RLS policies that allow users to access their own files only

-- Sample storage RLS policies (you need to set these in Supabase dashboard):
--
-- Policy 1: Users can upload their own files
-- CREATE POLICY "Users can upload to their folder"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'todo-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- Policy 2: Users can read their own files
-- CREATE POLICY "Users can read their own files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'todo-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
--
-- Policy 3: Users can delete their own files
-- CREATE POLICY "Users can delete their own files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'todo-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
