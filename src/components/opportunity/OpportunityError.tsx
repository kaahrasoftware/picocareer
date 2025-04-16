
import { Button } from "@/components/ui/button";
import { NavigateFunction } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

interface OpportunityErrorProps {
  navigate: NavigateFunction;
  message?: string;
}

export function OpportunityError({ navigate, message = "There was an error loading this opportunity. Please try again later." }: OpportunityErrorProps) {
  return (
    <div className="text-center max-w-md mx-auto p-6 bg-card rounded-lg shadow">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold">Error loading opportunity</h2>
      <p className="mt-2 text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" className="mt-4" onClick={() => navigate("/opportunities")}>
        Back to Opportunities
      </Button>
    </div>
  );
}
