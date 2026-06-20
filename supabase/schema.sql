-- 创建 todos 表
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 接入 auth 后新增：关联到 Supabase Auth 用户
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 启用行级安全
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 删除旧的匿名开放策略（如果存在）
DROP POLICY IF EXISTS "Allow anonymous read" ON todos;
DROP POLICY IF EXISTS "Allow anonymous insert" ON todos;
DROP POLICY IF EXISTS "Allow anonymous update" ON todos;
DROP POLICY IF EXISTS "Allow anonymous delete" ON todos;

-- 仅允许认证用户操作自己的数据
CREATE POLICY "Allow authenticated select own todos" ON todos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated insert own todos" ON todos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated update own todos" ON todos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated delete own todos" ON todos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
