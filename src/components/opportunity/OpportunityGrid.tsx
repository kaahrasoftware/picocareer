
import { OpportunityWithAuthor } from "@/types/opportunity/types";
import { OpportunityCard } from "./OpportunityCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface OpportunityGridProps {
  opportunities: OpportunityWithAuthor[];
  isLoading: boolean;
  error: Error | null;
}

export function OpportunityGrid({ opportunities, isLoading, error }: OpportunityGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-md p-4 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive mb-4">
          Error loading opportunities: {error.message}
        </p>
        <Button variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {opportunities.map((opportunity) => (
        <OpportunityCard key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  );
}
