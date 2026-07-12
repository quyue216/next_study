"use client"

import { useEffect, useId, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Todo, Priority } from "../_lib/todo-service"
import { Badge } from "@/components/ui/badge"
import { Tag, Paperclip, Image as ImageIcon, X, FileImage, Edit3 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { TableRow, TableCell } from "@/components/ui/table"

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

// 获取截止日期状态（逾期/今天到期/即将到期/正常）
function getDueDateStatus(dueDate?: string, completed?: boolean): 'overdue' | 'today' | 'soon' | 'normal' | null {
  if (!dueDate || completed) return null
  const now = new Date()
  const due = new Date(dueDate)
  // 重置时间部分，只比较日期
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diffDays = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays === 0) return 'today'
  if (diffDays <= 3) return 'soon'
  return 'normal'
}

// 截止日期状态对应的样式
function getDueDateStyle(status: ReturnType<typeof getDueDateStatus>) {
  switch (status) {
    case 'overdue':
      return { className: 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium', label: '已逾期' }
    case 'today':
      return { className: 'text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-medium', label: '今天到期' }
    case 'soon':
      return { className: 'text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded font-medium', label: '即将到期' }
    default:
      return { className: 'text-blue-600', label: '' }
  }
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

  // 子任务进度
  const subTasks = todo.subTasks ?? []
  const subTaskTotal = subTasks.length
  const subTaskCompleted = subTasks.filter(st => st.completed).length
  const subTaskPercent = subTaskTotal > 0 ? Math.round((subTaskCompleted / subTaskTotal) * 100) : 0

  // 截止日期状态
  const dueDateStatus = getDueDateStatus(todo.dueDate, todo.completed)

  const handleImageError = (id: string) => {
    setImageErrors(prev => new Set([...prev, id]))
  }

  return (
    <>
      <TableRow
        className={cn(
          isSelected && "bg-blue-50 dark:bg-blue-950/20",
          isTemp && "bg-blue-50/50 dark:bg-blue-950/20",
          isPending && isTemp && "animate-pulse"
        )}
      >
        {/* 序号和选择框 */}
        <TableCell className="text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-muted-foreground">{index}</span>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect?.(todo.id)}
              disabled={isPending}
            />
          </div>
        </TableCell>

        <TableCell className={cn("text-center", todo.completed && "line-through text-muted-foreground")}>
          <div className="font-medium">
            {todo.name}
            {isTemp && (
              <span className="ml-2 text-[10px] text-blue-500 font-medium">
                同步中
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <Badge className={cn("font-normal inline-flex justify-center", priorityInfo.className)}>
            {priorityInfo.text}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
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
        </TableCell>
        <TableCell className="text-center">
          {todo.dueDate ? (
            <div className="space-y-1">
              <div className={cn("text-xs", getDueDateStyle(dueDateStatus).className)}>
                {new Date(todo.dueDate).toLocaleDateString("zh-CN")}
              </div>
              {dueDateStatus && dueDateStatus !== 'normal' && (
                <div className="text-[10px] text-red-500 font-medium">
                  {getDueDateStyle(dueDateStatus).label}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </td>
        {/* 子任务进度 */}
        <td className="p-2 align-middle text-center">
          {subTaskTotal > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1">
                <div className="w-full max-w-[60px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      subTaskPercent === 100 ? "bg-green-500" : "bg-blue-500"
                    )}
                    style={{ width: `${subTaskPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {subTaskCompleted}/{subTaskTotal}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
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
        </TableCell>
        <TableCell className="text-center">
          <div className="text-xs text-muted-foreground">
            {createdAtText}
          </div>
        </TableCell>
        <TableCell className="text-center">
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
                {todo.attachments!.length}
              </Badge>
            </div>
          )}
        </TableCell>
        <TableCell className="text-center">
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
        </TableCell>
      </TableRow>

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
