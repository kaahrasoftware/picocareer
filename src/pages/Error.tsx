import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "Something went wrong";
  
  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "Page not found";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <AlertCircle className="h-24 w-24 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold">Oops!</h1>
        <p className="text-xl text-muted-foreground">
          {errorMessage}
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}