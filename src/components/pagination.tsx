"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

export interface PaginationProps {
  total: number
  page: number
  pageSize: number
  totalPages: number
  pageSizeOptions?: number[]
}

// 导出辅助函数供其他组件使用
export function usePaginationNavigation() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageUrl = (newPage: number, newPageSize?: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    if (newPageSize) {
      params.set("pageSize", newPageSize.toString())
    }
    return `?${params.toString()}`
  }

  const navigateToPage = (newPage: number, newPageSize?: number) => {
    router.push(createPageUrl(newPage, newPageSize))
  }

  const navigateToFirstPage = (newPageSize?: number) => {
    navigateToPage(1, newPageSize)
  }

  return { navigateToPage, navigateToFirstPage, createPageUrl }
}

export function Pagination({
  total,
  page,
  pageSize,
  totalPages,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const { navigateToPage } = usePaginationNavigation()

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    navigateToPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize, 10)
    // 当改变每页条数时，重置到第一页
    navigateToPage(1, size)
  }

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* 页码信息 */}
      <div className="text-sm text-muted-foreground">
        显示 {startItem}-{endItem} 条，共 {total} 条
      </div>

      <div className="flex items-center gap-2">
        {/* 每页条数选择 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">每页</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">条</span>
        </div>

        {/* 分页按钮 */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(1)}
            disabled={page <= 1}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* 页码显示 */}
          <div className="flex items-center gap-1 px-2">
            {renderPageNumbers()}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={page >= totalPages}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  function renderPageNumbers() {
    const pages: React.ReactNode[] = []
    const maxVisible = 5

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    // 调整起始页，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    // 显示第一页和省略号
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      )
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-1 text-muted-foreground">
            ...
          </span>
        )
      }
    }

    // 显示中间页码
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === page ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      )
    }

    // 显示最后一页和省略号
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-1 text-muted-foreground">
            ...
          </span>
        )
      }
      pages.push(
        <Button
          key={totalPages}
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      )
    }

    return pages
  }
}
