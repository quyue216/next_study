"use client"

import { useState, useRef, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Todo } from "../_lib/todo-service"
import { exportTodosAsJSON, exportTodosAsCSV } from "../_lib/export-utils"
import { importTodosFromJSON } from "../actions"
import { toast } from "sonner"
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react"

interface ImportExportMenuProps {
  todos: Todo[]
}

export function ImportExportMenu({ todos }: ImportExportMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (todos.length === 0 && !showMenu) return null

  const handleExportJSON = () => {
    exportTodosAsJSON(todos)
    toast.success("已导出 JSON")
    setShowMenu(false)
  }

  const handleExportCSV = () => {
    exportTodosAsCSV(todos)
    toast.success("已导出 CSV")
    setShowMenu(false)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
    setShowMenu(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      if (!content) return

      startTransition(async () => {
        try {
          const result = await importTodosFromJSON(content)
          if (result.imported > 0) {
            toast.success(`成功导入 ${result.imported} 个任务`)
          }
          if (result.errors.length > 0) {
            result.errors.forEach(err => toast.error(err))
          }
        } catch {
          toast.error("导入失败，请检查文件格式")
        }
      })
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="relative inline-block">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        disabled={todos.length === 0}
      >
        <Download className="size-4 mr-1" />
        导出/导入
      </Button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-md border bg-popover p-1 shadow-md">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <FileJson className="size-4" />
              导出 JSON
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <FileSpreadsheet className="size-4" />
              导出 CSV
            </button>
            <div className="my-1 border-t" />
            <button
              type="button"
              onClick={handleImportClick}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Upload className="size-4" />
              {isPending ? "导入中..." : "导入 JSON"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}