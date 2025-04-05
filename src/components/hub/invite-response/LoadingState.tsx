
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "./LoadingSpinner";

export function LoadingState() {
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-xl font-semibold">Verifying Invitation</h2>
          <p className="text-sm text-muted-foreground">Please wait while we verify your invitation...</p>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex items-center gap-3">
            <LoadingSpinner />
            <span>Verifying token...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
