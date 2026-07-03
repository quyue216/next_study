"use client"

import { useEffect, useId, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Todo, Priority } from "../_lib/todo-service"
import { Badge } from "@/components/ui/badge"
import { Tag, Paperclip, Image as ImageIcon, X, FileImage, Edit3 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"

interface TodoItemProps {
  todo: Todo
  index: number
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
  onToggleSelect?: (id: string) => void
  isSelected?: boolean
  isPending?: boolean
}

// 获取优先级的颜色和文本
function getPriorityInfo(priority?: Priority) {
  switch (priority) {
    case 'low':
      return { text: '低', variant: 'outline' as const, className: 'text-green-600 border-green-200 bg-green-50' }
    case 'medium':
      return { text: '中', variant: 'outline' as const, className: 'text-yellow-600 border-yellow-200 bg-yellow-50' }
    case 'high':
      return { text: '高', variant: 'outline' as const, className: 'text-red-600 border-red-200 bg-red-50' }
    default:
      return { text: '-', variant: 'outline' as const, className: 'text-gray-400' }
  }
}

// 判断是否是图片文件
function isImageFile(mimeType?: string) {
  return mimeType?.startsWith('image/') ?? false
}

export function TodoItem({ todo, index, onToggle, onDelete, onEdit, onToggleSelect, isSelected, isPending }: TodoItemProps) {
  const checkboxId = useId()
  const [createdAtText, setCreatedAtText] = useState("")
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCreatedAtText(new Date(todo.createdAt).toLocaleString("zh-CN"))
  }, [todo.createdAt])

  const isTemp = todo.id.startsWith('temp-')
  const priorityInfo = getPriorityInfo(todo.priority)
  const imageAttachments = todo.attachments?.filter(att => isImageFile(att.mimeType) && !imageErrors.has(att.id)) ?? []
  const hasAttachments = todo.attachments && todo.attachments.length > 0
  const hasTags = todo.tags && Array.isArray(todo.tags) && todo.tags.length > 0

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set([...prev, id]))
  }

  return (
    <>
      <tr
        className={cn(
          "border-b transition-colors hover:bg-muted/50",
          isSelected && "bg-blue-50 dark:bg-blue-950/20",
          isTemp && "bg-blue-50/50 dark:bg-blue-950/20",
          isPending && isTemp && "animate-pulse"
        )}
      >
        {/* 序号和选择框 */}
        <td className="p-2 align-middle text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">{index}</span>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(todo.id)}
              disabled={isPending}
            />
          </div>
        </td>

        <td className={cn("p-2 align-middle text-center", todo.completed && "line-through text-muted-foreground")}>
          <div className="font-medium">
            {todo.name}
            {isTemp && (
              <span className="ml-2 text-[10px] text-blue-500 font-medium">
                同步中
              </span>
            )}
          </div>
        </td>
        <td className="p-2 align-middle text-center">
          <Badge className={cn("font-normal inline-flex justify-center", priorityInfo.className)}>
            {priorityInfo.text}
          </Badge>
        </td>
        <td className="p-2 align-middle text-center">
          <div className="flex items-center justify-center gap-2">
            <Checkbox
              id={checkboxId}
              checked={todo.completed}
              disabled={isPending}
              onCheckedChange={(checked) => {
                onToggle(todo.id, checked as boolean)
              }}
            />
            <label htmlFor={checkboxId} className={`text-sm text-muted-foreground ${isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
              {todo.completed ? "已完成" : "未完成"}
            </label>
          </div>
        </td>
        <td className="p-2 align-middle text-center">
          {todo.dueDate ? (
            <div className="text-xs text-blue-600">
              {new Date(todo.dueDate).toLocaleDateString("zh-CN")}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </td>
        <td className="p-2 align-middle text-center">
          {hasTags ? (
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {todo.tags!.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </td>
        <td className="p-2 align-middle text-center">
          <div className="text-xs text-muted-foreground">
            {createdAtText}
          </div>
        </td>
        <td className="p-2 align-middle text-center">
          {hasAttachments && (
            <div className="space-y-1">
              {/* 图片预览缩略图 */}
              {imageAttachments.length > 0 && (
                <div className="flex gap-1 flex-wrap justify-center">
                  {imageAttachments.slice(0, 3).map((attachment) => (
                    <div
                      key={attachment.id}
                      className="w-8 h-8 rounded border overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-muted flex items-center justify-center"
                      onClick={() => setShowImagePreview(attachment.fileUrl)}
                    >
                      <img
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(attachment.id)}
                      />
                    </div>
                  ))}
                  {imageAttachments.length > 3 && (
                    <span className="text-xs text-muted-foreground flex items-center">+{imageAttachments.length - 3}</span>
                  )}
                </div>
              )}
              {/* 如果有图片但都加载失败，显示图标 */}
              {imageAttachments.length === 0 && todo.attachments?.some(att => isImageFile(att.mimeType)) && (
                <div className="flex gap-1 justify-center">
                  <FileImage className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {/* 附件数量 */}
              <Badge variant="outline" className="text-xs">
                <Paperclip className="w-3 h-3 mr-1" />
                {todo.attachments.length}
              </Badge>
            </div>
          )}
        </td>
        <td className="p-2 align-middle text-center">
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => onEdit(todo)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => onDelete(todo.id)}
            >
              删除
            </Button>
          </div>
        </td>
      </tr>

      {/* 图片预览对话框 */}
      {showImagePreview && (
        <Dialog open={!!showImagePreview} onOpenChange={() => setShowImagePreview(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">图片预览</DialogTitle>
            <div className="relative">
              <img
                src={showImagePreview}
                alt="预览"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <DialogClose className="absolute top-2 right-2">
                <Button variant="outline" size="icon-sm">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
