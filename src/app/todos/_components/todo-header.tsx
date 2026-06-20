"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { logoutAction } from "@/app/auth/actions";

export function TodoHeader({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);

  // 水合修复：只在客户端挂载后显示用户信息
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">任务列表</h1>
        <div className="flex items-center gap-3">
          {/* 测试按钮 */}
          <button
            onClick={() => alert('测试按钮被点击了！')}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            点我测试
          </button>

          {isMounted && user && (
            <span className="text-sm text-muted-foreground">{user.email}</span>
          )}
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              退出
            </Button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
