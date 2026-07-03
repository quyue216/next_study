import { Skeleton } from "@/components/ui/skeleton"

export function TodoListLoading() {
  return (
    <div className="py-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b">
          <Skeleton className="h-5 w-32 mx-auto" />
          <Skeleton className="h-5 w-12 mx-auto" />
          <Skeleton className="h-5 w-24 mx-auto" />
          <Skeleton className="h-5 w-24 mx-auto" />
          <Skeleton className="h-5 w-28 mx-auto" />
          <Skeleton className="h-5 w-24 mx-auto" />
          <Skeleton className="h-5 w-20 mx-auto" />
          <Skeleton className="h-8 w-28 mx-auto rounded-md" />
        </div>
      ))}
    </div>
  )
}
