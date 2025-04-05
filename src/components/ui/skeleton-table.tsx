
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  showHeader = true
}: SkeletonTableProps) {
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div className="w-full border rounded-md overflow-hidden">
        {showHeader && (
          <div className="bg-muted/50 p-4 border-b">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-[180px]" />
              <Skeleton className="h-9 w-[120px]" />
            </div>
          </div>
        )}
        
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex items-center p-4 space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className={`flex-1 ${colIndex === 0 ? 'max-w-[40px]' : ''}`}>
                  <Skeleton className={`h-5 ${colIndex === 0 ? 'w-5 rounded-full' : 'w-full'}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
