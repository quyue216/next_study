"use client"

import { Button } from "@/components/ui/button"
import { List, Columns3 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ViewSwitcherProps {
  currentView: "list" | "kanban"
}

export function ViewSwitcher({ currentView }: ViewSwitcherProps) {
  const router = useRouter()

  const switchTo = (view: "list" | "kanban") => {
    if (view === currentView) return
    const params = new URLSearchParams(window.location.search)
    if (view === "list") {
      params.delete("view")
    } else {
      params.set("view", view)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="inline-flex rounded-md border">
      <Button
        variant={currentView === "list" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => switchTo("list")}
        className="rounded-r-none"
      >
        <List className="size-4 mr-1" />
        列表
      </Button>
      <Button
        variant={currentView === "kanban" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => switchTo("kanban")}
        className="rounded-l-none"
      >
        <Columns3 className="size-4 mr-1" />
        看板
      </Button>
    </div>
  )
}