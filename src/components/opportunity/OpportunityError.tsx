
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";

interface OpportunityErrorProps {
  navigate: NavigateFunction;
}

export function OpportunityError({ navigate }: OpportunityErrorProps) {
  return (
    <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow">
      <h2 className="text-2xl font-bold">Error loading opportunity</h2>
      <p className="mt-2 text-muted-foreground">
        There was an error loading this opportunity. Please try again later.
      </p>
      <Button variant="outline" className="mt-4" onClick={() => navigate("/opportunities")}>
        Back to Opportunities
      </Button>
    </div>
  );
}
