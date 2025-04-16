
import { Skeleton } from "@/components/ui/skeleton";

export function OpportunityLoading() {
  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <Skeleton className="h-10 w-40" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-6 w-1/3 mb-6" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="md:w-1/3">
          <div className="sticky top-24">
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
