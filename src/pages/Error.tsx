import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error has occurred.";
  let errorCode = "500";
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "An error occurred";
    errorCode = error.status.toString();
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-20 w-20 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Error {errorCode}</h1>
          <p className="text-lg text-muted-foreground">
            {errorMessage}
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}