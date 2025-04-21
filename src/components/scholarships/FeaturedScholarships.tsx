
import { Trophy } from "lucide-react";
import { ScholarshipGrid } from "./ScholarshipGrid";

interface FeaturedScholarshipsProps {
  scholarships: any[];
}

export function FeaturedScholarships({ scholarships }: FeaturedScholarshipsProps) {
  if (!scholarships.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-semibold">Featured Scholarships</h2>
      </div>
      <ScholarshipGrid
        scholarships={scholarships.slice(0, 4)}
        isLoading={false}
        compact={true}
      />
    </div>
  );
}
