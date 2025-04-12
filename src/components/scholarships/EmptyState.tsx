
import { Search, School, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  resetFilters?: () => void;
}

export function EmptyState({ resetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center 
                    bg-gradient-to-b from-blue-50/70 to-indigo-50/70 rounded-xl border border-dashed
                    border-blue-200 shadow-sm">
      <div className="bg-white p-5 rounded-full mb-4 shadow-sm">
        <Search className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-gray-800">No scholarships found</h3>
      <p className="text-muted-foreground max-w-md mb-7">
        We couldn't find any scholarships matching your search criteria. Try adjusting your filters or check back later for new opportunities.
      </p>
      
      {resetFilters && (
        <Button 
          onClick={resetFilters} 
          variant="outline"
          className="gap-2 bg-white hover:bg-blue-50"
          size="lg"
        >
          <FilterX className="h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </div>
  );
}
