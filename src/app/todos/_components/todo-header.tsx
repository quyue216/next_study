"use client";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/auth/actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export function TodoHeader({
  email,
  children,
}: {
  email?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">任务列表</h1>
        <div className="flex items-center gap-3">
          {email && (
            <span className="text-sm text-muted-foreground">{email}</span>
          )}
          <Link href="/todos/trash">
            <Button variant="ghost" size="sm">
              <Trash2 className="size-4 mr-1" />
              回收站
            </Button>
          </Link>
          <ThemeToggle />
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
