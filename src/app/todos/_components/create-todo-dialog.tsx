'use client'

import React, { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X, Trash2, FileUp, Loader2, Edit3, Paperclip, FileImage } from 'lucide-react'
import { Priority, Todo, TodoAttachment, SubTask } from '../_lib/todo-service'
import { createTodoWithDetailsAndAttachments, updateTodoDetails, createSubTask, removeSubTask, removeAttachment, updateSubTaskState } from '../actions'
import { Checkbox } from '@/components/ui/checkbox'

interface Attachment {
  file: File
  previewUrl: string
}

// 优先级中英文映射，解决 Select 组件显示英文原始值的问题
type PriorityLabel = '低' | '中' | '高'
const PRIORITY_TO_LABEL: Record<Priority, PriorityLabel> = {
  low: '低',
  medium: '中',
  high: '高',
}
const LABEL_TO_PRIORITY: Record<string, Priority> = {
  '低': 'low',
  '中': 'medium',
  '高': 'high',
}

interface CreateTodoDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  todo?: Todo | null  // 编辑模式时传入
  onSubmit?: (data: {
    name: string
    priority?: Priority
    dueDate?: string
    tags?: string[]
    newSubTasks?: string[]
    deletedSubTaskIds?: string[]
    newAttachments?: Attachment[]
    deletedAttachmentIds?: string[]
  }) => Promise<void>
}

export function CreateTodoDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  todo,
  onSubmit
}: CreateTodoDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen

  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [name, setName] = useState('')
  const [priority, setPriority] = useState<PriorityLabel | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [subTasks, setSubTasks] = useState<string[]>([])
  const [subTaskInput, setSubTaskInput] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [existingAttachments, setExistingAttachments] = useState<TodoAttachment[]>([])
  const [existingSubTasks, setExistingSubTasks] = useState<SubTask[]>([])
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>([])
  const [deletedSubTaskIds, setDeletedSubTaskIds] = useState<string[]>([])
  const [toggledSubTaskIds, setToggledSubTaskIds] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = !!todo
  const dialogTitle = isEditMode ? '编辑待办事项' : '新建待办事项'
  const submitButtonText = isEditMode ? (isPending || isUploading ? '保存中...' : '保存') : (isPending || isUploading ? '创建中...' : '创建')

  // 编辑模式：初始化表单数据
  useEffect(() => {
    if (todo) {
      setName(todo.name)
      setPriority(todo.priority ? PRIORITY_TO_LABEL[todo.priority] : '')
      setDueDate(todo.dueDate || '')
      setTags(todo.tags || [])
      setExistingAttachments(todo.attachments || [])
      setExistingSubTasks(todo.subTasks || [])
    }
  }, [todo])

  // 重置表单
  const resetForm = useCallback(() => {
    setName('')
    setPriority('')
    setDueDate('')
    setTagsInput('')
    setTags([])
    setSubTasks([])
    setSubTaskInput('')
    setAttachments([])
    setExistingAttachments([])
    setExistingSubTasks([])
    setDeletedAttachmentIds([])
    setDeletedSubTaskIds([])
    setToggledSubTaskIds(new Set())
    setIsUploading(false)
  }, [])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setTimeout(resetForm, 200)
    }
  }, [resetForm, setOpen])

  const handleAddTag = useCallback(() => {
    if (tagsInput.trim() && !tags.includes(tagsInput.trim())) {
      setTags([...tags, tagsInput.trim()])
      setTagsInput('')
    }
  }, [tagsInput, tags])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  const handleAddSubTask = useCallback(() => {
    if (subTaskInput.trim()) {
      setSubTasks([...subTasks, subTaskInput.trim()])
      setSubTaskInput('')
    }
  }, [subTaskInput, subTasks])

  const handleRemoveSubTask = useCallback((index: number) => {
    setSubTasks(subTasks.filter((_, i) => i !== index))
  }, [subTasks])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newAttachments: Attachment[] = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setAttachments(prev => [...prev, ...newAttachments])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev]
      URL.revokeObjectURL(newAttachments[index].previewUrl)
      newAttachments.splice(index, 1)
      return newAttachments
    })
  }, [])

  // 判断是否是图片文件
  const isImageFile = (mimeType?: string) => {
    return mimeType?.startsWith('image/') ?? false
  }

  const handleSubmit = useCallback(() => {
    if (!name.trim()) return

    startTransition(async () => {
      setIsUploading(true)
      try {
        if (isEditMode && onSubmit) {
          // 编辑模式：先切换子任务状态
          if (toggledSubTaskIds.size > 0) {
            await Promise.all(
              Array.from(toggledSubTaskIds).map(subTaskId => {
                const subTask = existingSubTasks.find(st => st.id === subTaskId)
                return updateSubTaskState(subTaskId, undefined, subTask ? !subTask.completed : undefined)
              })
            )
          }
          await onSubmit({
            name: name.trim(),
            priority: priority ? LABEL_TO_PRIORITY[priority] : undefined,
            dueDate: dueDate || undefined,
            tags: tags.length > 0 ? tags : undefined,
            newSubTasks: subTasks.length > 0 ? subTasks : undefined,
            deletedSubTaskIds: deletedSubTaskIds.length > 0 ? deletedSubTaskIds : undefined,
            newAttachments: attachments.length > 0 ? attachments : undefined,
            deletedAttachmentIds: deletedAttachmentIds.length > 0 ? deletedAttachmentIds : undefined,
          })
        } else {
          // 创建模式
          const formData = new FormData()
          formData.append('name', name.trim())
          if (priority) formData.append('priority', LABEL_TO_PRIORITY[priority])
          if (dueDate) formData.append('dueDate', dueDate)
          if (tags.length > 0) formData.append('tags', JSON.stringify(tags))
          if (subTasks.length > 0) formData.append('subTasks', JSON.stringify(subTasks))

          for (const attachment of attachments) {
            formData.append('files', attachment.file)
          }

          await createTodoWithDetailsAndAttachments(formData)
        }
        // 成功后关闭对话框并重置表单
        setOpen(false)
        setTimeout(resetForm, 100)
      } finally {
        setIsUploading(false)
      }
    })
  }, [name, priority, dueDate, tags, subTasks, attachments, isEditMode, onSubmit, setOpen, resetForm, toggledSubTaskIds, existingSubTasks, deletedSubTaskIds, deletedAttachmentIds])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <>
      {/* 只有在创建模式（非编辑模式）下才渲染触发按钮 */}
      {!isEditMode && (
        trigger ? (
          React.cloneElement(trigger as React.ReactElement, {
            onClick: (e: React.MouseEvent) => {
              const originalOnClick = (trigger as React.ReactElement).props.onClick;
              if (originalOnClick) originalOnClick(e);
              setOpen(true);
            }
          })
        ) : (
          !isControlled && (
            <Button variant="secondary" onClick={() => setOpen(true)}>添加</Button>
          )
        )
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode && <Edit3 className="size-4" />}
              {dialogTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 任务名称 */}
            <div className="grid gap-2">
              <Label htmlFor="name">任务名称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入任务名称"
                disabled={isPending || isUploading}
              />
            </div>

            {/* 优先级和到期日 - 并排显示 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 优先级 */}
              <div className="grid gap-2">
                <Label htmlFor="priority">优先级</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as PriorityLabel)}
                  disabled={isPending || isUploading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="请选择优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="低">低</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="高">高</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 到期日 */}
              <div className="grid gap-2">
                <Label htmlFor="dueDate">到期日</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isPending || isUploading}
                />
              </div>
            </div>

            {/* 标签 */}
            <div className="grid gap-2">
              <Label>标签</Label>
              <div className="flex gap-2">
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="输入标签"
                  disabled={isPending || isUploading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagsInput.trim() || isPending || isUploading}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isPending || isUploading}
                        className="hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 子任务 */}
            <div className="grid gap-2">
              <Label>子任务</Label>

              {/* 编辑模式：显示现有子任务 + 新增子任务 */}
              {isEditMode && (
                <div className="grid gap-2">
                  {/* 现有子任务（可切换完成状态、可删除） */}
                  {existingSubTasks.filter(st => !deletedSubTaskIds.includes(st.id)).map((subTask) => {
                    const isToggled = toggledSubTaskIds.has(subTask.id)
                    const displayCompleted = isToggled ? !subTask.completed : subTask.completed
                    return (
                    <div
                      key={subTask.id}
                      className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={displayCompleted}
                          onCheckedChange={() => {
                            setToggledSubTaskIds(prev => {
                              const next = new Set(prev)
                              if (next.has(subTask.id)) {
                                next.delete(subTask.id)
                              } else {
                                next.add(subTask.id)
                              }
                              return next
                            })
                          }}
                          disabled={isPending || isUploading}
                        />
                        <span className={`text-sm ${displayCompleted ? 'line-through text-muted-foreground' : ''}`}>{subTask.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeletedSubTaskIds(prev => [...prev, subTask.id])}
                        disabled={isPending || isUploading}
                        className="hover:text-destructive shrink-0"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )})}

                  {/* 新增子任务输入框 */}
                  <div className="flex gap-2">
                    <Input
                      value={subTaskInput}
                      onChange={(e) => setSubTaskInput(e.target.value)}
                      placeholder="输入新子任务"
                      disabled={isPending || isUploading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSubTask()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSubTask}
                      disabled={!subTaskInput.trim() || isPending || isUploading}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {/* 新添加的子任务（可删除） */}
                  {subTasks.length > 0 && (
                    <div className="grid gap-2">
                      {subTasks.map((subTask, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
                        >
                          <span className="text-sm">{subTask}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubTask(index)}
                            disabled={isPending || isUploading}
                            className="hover:text-destructive"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 新添加的子任务（创建模式下） */}
              {!isEditMode && (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={subTaskInput}
                      onChange={(e) => setSubTaskInput(e.target.value)}
                      placeholder="输入子任务"
                      disabled={isPending || isUploading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSubTask()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSubTask}
                      disabled={!subTaskInput.trim() || isPending || isUploading}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {subTasks.length > 0 && (
                    <div className="grid gap-2">
                      {subTasks.map((subTask, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
                        >
                          <span className="text-sm">{subTask}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubTask(index)}
                            disabled={isPending || isUploading}
                            className="hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 附件 */}
            <div className="grid gap-2">
              <Label>附件</Label>
              <div className="grid gap-2">
                {/* 上传按钮（所有模式都可用） */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  disabled={isPending || isUploading}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPending || isUploading}
                  className="w-full"
                >
                  <FileUp className="size-4 mr-2" />
                  上传文件
                </Button>

                {/* 显示现有附件（编辑模式，可删除） */}
                {isEditMode && existingAttachments.filter(a => !deletedAttachmentIds.includes(a.id)).length > 0 && (
                  <div className="grid gap-2">
                    {existingAttachments.filter(a => !deletedAttachmentIds.includes(a.id)).map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isImageFile(attachment.mimeType) ? (
                            <FileImage className="size-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="text-sm truncate">{attachment.fileName}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({formatFileSize(attachment.fileSize)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeletedAttachmentIds(prev => [...prev, attachment.id])}
                          disabled={isPending || isUploading}
                          className="hover:text-destructive shrink-0 ml-2"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 显示新上传的附件 */}
                {attachments.length > 0 && (
                  <div className="grid gap-2">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileUp className="size-4 shrink-0 text-muted-foreground" />
                          <span className="text-sm truncate">{attachment.file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({formatFileSize(attachment.file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          disabled={isPending || isUploading}
                          className="hover:text-destructive shrink-0 ml-2"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={isPending || isUploading} onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || isPending || isUploading}>
              {isPending || isUploading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {submitButtonText}
                </>
              ) : submitButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
