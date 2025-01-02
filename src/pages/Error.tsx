import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "Page not found";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as { message: unknown }).message);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-destructive mb-4">
        <AlertCircle className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
      <p className="text-muted-foreground mb-6">{errorMessage}</p>
      <div className="space-x-4">
        <Button onClick={() => navigate(-1)}>Go Back</Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    </div>
  );
}