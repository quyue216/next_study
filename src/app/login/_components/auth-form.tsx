"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginAction, registerAction, type AuthState } from "@/app/auth/actions";

const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

const registerSchema = z
  .object({
    email: z.string().email("请输入有效邮箱"),
    password: z.string().min(6, "密码至少 6 位"),
    confirmPassword: z.string().min(1, "请确认密码"),
    nickname: z.string().min(2, "昵称至少 2 位").max(20, "昵称最多 20 位"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码输入不一致",
    path: ["confirmPassword"],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

function ErrorText({ message }: { message?: string }) {
  return message ? (
    <p className="text-sm text-destructive min-h-[20px]">{message}</p>
  ) : (
    <p className="min-h-[20px]" />
  );
}

export function AuthForm() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginState, setLoginState] = useState<AuthState>({});
  const [registerState, setRegisterState] = useState<AuthState>({});

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "10676114@qq.com", password: "current520" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", nickname: "" },
  });

  async function handleLogin(data: LoginForm) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await loginAction({}, formData);
    setLoginState(result);

    // 如果服务端返回字段错误，同步到 react-hook-form
    if (result.fieldErrors) {
      loginForm.setError("email", { message: result.fieldErrors.email ?? "" });
      loginForm.setError("password", {
        message: result.fieldErrors.password ?? "",
      });
    }
  }

  async function handleRegister(data: RegisterForm) {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("nickname", data.nickname);

    const result = await registerAction({}, formData);
    setRegisterState(result);

    if (result.success) {
      registerForm.reset();
      setTimeout(() => setActiveTab("login"), 1500);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">欢迎使用</CardTitle>
        <CardDescription>请登录或注册您的账户</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            loginForm.reset();
            registerForm.reset();
            setLoginState({});
            setRegisterState({});
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">邮箱</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  {...loginForm.register("email")}
                />
                <ErrorText message={loginState.fieldErrors?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">密码</Label>
                <Input
                  id="login-password"
                  type="password"
                  {...loginForm.register("password")}
                />
                <ErrorText message={loginState.fieldErrors?.password} />
              </div>
              {loginState.error && (
                <p className="text-sm text-destructive">{loginState.error}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? "登录中..." : "登录"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="register-email">邮箱</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="name@example.com"
                  {...registerForm.register("email")}
                />
                <ErrorText message={registerState.fieldErrors?.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-nickname">昵称</Label>
                <Input
                  id="register-nickname"
                  type="text"
                  placeholder="取个名字"
                  {...registerForm.register("nickname")}
                />
                <ErrorText message={registerForm.formState.errors.nickname?.message ?? registerState.fieldErrors?.nickname} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">密码</Label>
                <Input
                  id="register-password"
                  type="password"
                  {...registerForm.register("password")}
                />
                <ErrorText message={registerState.fieldErrors?.password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">确认密码</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  {...registerForm.register("confirmPassword")}
                />
                <ErrorText message={registerForm.formState.errors.confirmPassword?.message} />
              </div>
              {registerState.error && (
                <p className="text-sm text-destructive">{registerState.error}</p>
              )}
              {registerState.success && (
                <p className="text-sm text-green-600">{registerState.success}</p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting ? "注册中..." : "注册"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );



}
