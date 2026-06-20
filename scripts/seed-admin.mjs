import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const root = path.resolve(process.cwd());
loadEnv(path.join(root, '.env.local'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请检查 .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = 'admin@trackwork.local';
const ADMIN_PASSWORD = 'Admin123456';

async function main() {
  const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  let adminUser = existing.users.find((u) => u.email === ADMIN_EMAIL);

  if (!adminUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    if (error) throw error;
    adminUser = data.user;
    console.log('已创建 admin 用户:', adminUser.id);
  } else {
    console.log('admin 用户已存在:', adminUser.id);
  }

  const { error: updateError } = await supabase
    .from('todos')
    .update({ user_id: adminUser.id })
    .is('user_id', null);

  if (updateError) throw updateError;

  console.log('已将匿名 todos 关联到 admin 用户');
  console.log('请登录后尽快修改 admin 默认密码。');
}

main().catch((err) => {
  console.error('失败:', err);
  process.exit(1);
});
