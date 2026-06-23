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

-- 创建 profiles 表（存用户昵称等信息）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- profiles 策略：用户只能看/改自己的记录
CREATE POLICY "Allow authenticated select own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow authenticated insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 自动创建 profile 的 trigger：用户注册后自动插一条记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
