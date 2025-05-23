
import { Skeleton } from "@/components/ui/skeleton";

export function SchoolDetailSkeleton() {
  return (
    <div className="container mx-auto py-12 space-y-8">
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="pt-16">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
