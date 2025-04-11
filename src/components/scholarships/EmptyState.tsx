
import { Search, School } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  resetFilters?: () => void;
}

export function EmptyState({ resetFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/30 rounded-lg border border-dashed">
      <div className="bg-primary-foreground p-4 rounded-full mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No scholarships found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        We couldn't find any scholarships matching your search criteria. Try adjusting your filters or check back later for new opportunities.
      </p>
      
      {resetFilters && (
        <Button onClick={resetFilters} variant="outline">
          Reset Filters
        </Button>
      )}
    </div>
  );
}
