
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface SkeletonGridProps {
  itemCount?: number;
  columns?: number;
  className?: string;
}

export function SkeletonGrid({ itemCount = 6, columns = 3, className }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-6 ${className || ''}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
