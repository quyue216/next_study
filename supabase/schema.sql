-- 创建 todos 表
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 启用行级安全（后续接入认证时使用）
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 匿名可读写策略（无认证时使用，后续接入 auth 后可删除）
CREATE POLICY "Allow anonymous read" ON todos
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON todos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON todos
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete" ON todos
  FOR DELETE USING (true);
