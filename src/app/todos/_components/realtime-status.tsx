"use client"

import { cn } from "@/lib/utils"

interface RealtimeStatusProps {
  isConnected: boolean
}

export function RealtimeStatus({ isConnected }: RealtimeStatusProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block w-2 h-2 rounded-full",
          isConnected ? "bg-green-500" : "bg-red-500"
        )}
      />
      <span className="text-xs text-muted-foreground">
        {isConnected ? "实时同步中" : "连接断开"}
      </span>
    </div>
  )
}