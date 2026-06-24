import { Skeleton } from "@/components/ui/skeleton"

export function TodoListLoading() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 border rounded-lg"
        >
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      ))}
    </div>
  )
}
