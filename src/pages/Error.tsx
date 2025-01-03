import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Error() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error occurred";
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "Page not found";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Oops! Something went wrong
        </h1>
        <p className="text-muted-foreground">
          {errorMessage}
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = "/"}
          >
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
}