'use client'

import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { CreateTodoDialog } from './create-todo-dialog'

interface AddTodoInputProps {
  onAdd: (name: string) => void
  isPending: boolean
}

export function AddTodoInput({ onAdd, isPending }: AddTodoInputProps) {
  return (
    <CreateTodoDialog
      trigger={
        <Button
          variant="secondary"
          disabled={isPending}
          className="shrink-0"
        >
          <Plus className="size-4 mr-1" />
          添加
        </Button>
      }
    />
  )
}
