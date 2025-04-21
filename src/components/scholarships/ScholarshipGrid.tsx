
import { Loader2 } from "lucide-react";
import { ScholarshipCard } from "./ScholarshipCard";
import { EmptyState } from "@/components/scholarships/EmptyState";

interface Scholarship {
  id: string;
  title: string;
  description: string;
  provider_name: string;
  amount: number | null;
  deadline: string | null;
  status: string;
  application_url: string | null;
  category: string[];
  tags: string[];
  featured: boolean;
}

interface ScholarshipGridProps {
  scholarships: Scholarship[];
  isLoading: boolean;
  compact?: boolean;
  resetFilters?: () => void;
}

export function ScholarshipGrid({ scholarships, isLoading, compact = false, resetFilters }: ScholarshipGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#F1F0FB] rounded-xl">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading scholarships...</span>
      </div>
    );
  }

  if (!scholarships || scholarships.length === 0) {
    return <EmptyState resetFilters={resetFilters} />;
  }

  return (
    <div className={`grid gap-4 bg-[#F1F0FB] rounded-xl p-2 ${compact 
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
      {scholarships.map((scholarship) => (
        <ScholarshipCard 
          key={scholarship.id} 
          scholarship={scholarship} 
          compact={compact}
        />
      ))}
    </div>
  );
}
