import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error occurred";
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight">Oops! Something went wrong</h1>
        
        <p className="text-gray-600 max-w-md">
          {errorMessage}
        </p>

        <div className="pt-4">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-picocareer-primary hover:bg-picocareer-accent"
          >
            Go Back Home
          </Button>
        </div>
      </div>
    </div>
  );
}