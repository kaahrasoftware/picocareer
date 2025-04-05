
import { SkeletonCard } from "@/components/ui/skeleton-card";

interface SkeletonGridProps {
  itemCount?: number;
  columns?: number;
}

export function SkeletonGrid({ itemCount = 6, columns = 3 }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
