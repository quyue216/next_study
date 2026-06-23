"use server";

import { z } from "zod";
import { createServerClient, supabaseServer } from "@/lib/supabase.server";
import { redirect } from "next/navigation";

const authSchema = z.object({
  email: z.string({ required_error: "请输入邮箱" }).email("邮箱格式不正确"),
  password: z.string({ required_error: "请输入密码" }).min(6, "密码至少 6 位"),
});

const registerSchema = z.object({
  email: z.string({ required_error: "请输入邮箱" }).email("邮箱格式不正确"),
  password: z.string({ required_error: "请输入密码" }).min(6, "密码至少 6 位"),
  nickname: z.string({ required_error: "请输入昵称" }).min(2, "昵称至少 2 位").max(20, "昵称最多 20 位"),
});

const getFieldErrors = (error: z.ZodError) => {
  const flattened = error.flatten().fieldErrors;
  return {
    email: flattened.email?.[0],
    password: flattened.password?.[0],
    nickname: flattened.nickname?.[0],
  };
};

export type AuthState = {
  error?: string;
  success?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    nickname?: string;
  };
};

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/todos");
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    nickname: formData.get("nickname"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
    };
  }

  const { email, password, nickname } = parsed.data;

  // 使用 service role 客户端检查邮箱是否已注册
  const { data: existingUsers, error: listError } =
    await supabaseServer.auth.admin.listUsers();
  if (listError) {
    return { error: listError.message };
  }

  const alreadyExists = existingUsers.users.some(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  );
  if (alreadyExists) {
    return { error: "该邮箱已注册，请直接登录" };
  }

  const supabase = await createServerClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 如果注册成功且有 user id，用 service role 更新 profile 的 nickname
  if (authData?.user?.id) {
    const { error: updateError } = await supabaseServer
      .from("profiles")
      .update({ nickname })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("更新 profile 昵称失败:", updateError);
    }
  }

  return { success: "注册成功，请查收邮件完成验证" };
}

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
