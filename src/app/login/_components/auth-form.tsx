"use client";

import { useActionState } from "react";
import { loginAction, registerAction, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState: AuthState = {};

function AuthMessage({ state }: { state: AuthState }) {
  if (state.error) {
    return <p className="text-sm text-destructive">{state.error}</p>;
  }
  if (state.success) {
    return <p className="text-sm text-green-600">{state.success}</p>;
  }
  return null;
}

export function AuthForm() {
  const [loginState, loginActionDispatch, loginPending] = useActionState(
    loginAction,
    initialState
  );
  const [registerState, registerActionDispatch, registerPending] = useActionState(
    registerAction,
    initialState
  );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>欢迎使用</CardTitle>
        <CardDescription>登录或注册以管理任务</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <form action={loginActionDispatch} className="flex flex-col gap-4">
              <Input
                name="email"
                type="email"
                placeholder="邮箱"
                required
                autoComplete="email"
              />
              <Input
                name="password"
                type="password"
                placeholder="密码"
                required
                minLength={6}
                autoComplete="current-password"
              />
              <AuthMessage state={loginState} />
              <Button type="submit" disabled={loginPending} className="w-full">
                {loginPending ? "登录中..." : "登录"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="mt-4">
            <form action={registerActionDispatch} className="flex flex-col gap-4">
              <Input
                name="email"
                type="email"
                placeholder="邮箱"
                required
                autoComplete="email"
              />
              <Input
                name="password"
                type="password"
                placeholder="密码"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <AuthMessage state={registerState} />
              <Button type="submit" disabled={registerPending} className="w-full">
                {registerPending ? "注册中..." : "注册"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
