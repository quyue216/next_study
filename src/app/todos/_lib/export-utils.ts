"use client"

import { Todo } from "./todo-service"

export function exportTodosAsJSON(todos: Todo[]): void {
  const exportData = todos.map(t => ({
    name: t.name,
    completed: t.completed,
    priority: t.priority ?? null,
    dueDate: t.dueDate ?? null,
    tags: t.tags ?? [],
    subTasks: (t.subTasks ?? []).map(st => ({
      name: st.name,
      completed: st.completed,
    })),
    attachments: (t.attachments ?? []).map(att => ({
      fileName: att.fileName,
      fileUrl: att.fileUrl,
      fileSize: att.fileSize,
      mimeType: att.mimeType,
    })),
    sortOrder: t.sortOrder ?? 0,
  }))

  const json = JSON.stringify(exportData, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  downloadBlob(blob, `todos-export-${formatDate()}.json`)
}

export function exportTodosAsCSV(todos: Todo[]): void {
  const headers = ["name", "completed", "priority", "dueDate", "tags", "subtasks", "sortOrder"]
  const rows = todos.map(t => [
    escapeCsv(t.name),
    String(t.completed),
    t.priority ?? "",
    t.dueDate ?? "",
    (t.tags ?? []).join(","),
    (t.subTasks ?? []).map(st => st.name).join("|"),
    String(t.sortOrder ?? 0),
  ])

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  downloadBlob(blob, `todos-export-${formatDate()}.csv`)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}