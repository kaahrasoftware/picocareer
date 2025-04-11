
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <FileSearch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">No scholarships found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        We couldn't find any scholarships matching your criteria. Try adjusting your filters or check back later.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link to="/scholarships">View All Scholarships</Link>
        </Button>
      </div>
    </div>
  );
}
