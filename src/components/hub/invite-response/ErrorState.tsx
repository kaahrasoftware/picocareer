
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  // Log error for debugging
  console.error("Hub invitation error:", error);
  
  // Determine if this is a format error or another type
  const isFormatError = error.includes("format") || error.includes("invalid");
  const isExpiredError = error.includes("expired");
  const isEmailMismatchError = error.includes("was sent to");
  const isProcessedError = error.includes("already been");

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Verification Failed</h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">{error}</p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p>Common solutions:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {isFormatError && (
                <li>Double-check that you've copied the entire token from your invitation</li>
              )}
              {isExpiredError && (
                <li>Ask the hub administrator to send you a new invitation</li>
              )}
              {isEmailMismatchError && (
                <li>Sign in with the email address that received the invitation</li>
              )}
              {isProcessedError && (
                <li>This invitation has already been used, check your hubs dashboard</li>
              )}
              <li>Make sure you are signed in with the correct account</li>
              <li>Contact the hub administrator for assistance</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild>
            <Link to="/hubs" className="flex items-center gap-1 w-full sm:w-auto justify-center">
              <ArrowLeft className="h-4 w-4" />
              Return to Hubs
            </Link>
          </Button>
          
          <Button 
            variant="default" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 w-full sm:w-auto justify-center"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
