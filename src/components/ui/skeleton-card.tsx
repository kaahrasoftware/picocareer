import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn(
      "rounded-lg border bg-[#F1F0FB] p-6 space-y-4",
      className
    )}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full bg-[#E5DEFF]" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[60%] bg-[#E5DEFF]" />
          <Skeleton className="h-3 w-[80%] bg-[#E5DEFF]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-[#E5DEFF]" />
        <Skeleton className="h-3 w-[90%] bg-[#E5DEFF]" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 bg-[#D6BCFA]" />
        <Skeleton className="h-5 w-16 bg-[#D6BCFA]" />
        <Skeleton className="h-5 w-16 bg-[#D6BCFA]" />
      </div>
      <Skeleton className="h-9 w-full mt-auto bg-[#D6BCFA]" />
    </div>
  );
}
