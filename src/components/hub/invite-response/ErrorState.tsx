
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw, Mail, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

export function ErrorState({ error }: ErrorStateProps) {
  const navigate = useNavigate();
  
  // Log error for debugging
  console.error("Hub invitation error:", error);
  
  // Determine error type to show appropriate guidance
  const isFormatError = error.includes("format") || error.includes("invalid");
  const isExpiredError = error.includes("expired");
  const isEmailMismatchError = error.includes("was sent to") || error.includes("signed in as");
  const isProcessedError = error.includes("already been");
  const isNoInvitationsError = error.includes("No pending invitations");

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth?redirect=/hub-invite");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">
            {isEmailMismatchError 
              ? "Email Mismatch Detected" 
              : isNoInvitationsError
                ? "No Invitations Found"
                : "Verification Failed"}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">{error}</p>
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p>How to resolve this:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {isFormatError && (
                <li>Double-check that you've copied the entire token from your invitation</li>
              )}
              {isExpiredError && (
                <li>Ask the hub administrator to send you a new invitation</li>
              )}
              {isEmailMismatchError && (
                <>
                  <li>Sign out using the button below</li>
                  <li>Sign in with the email address that received the invitation</li>
                  <li>Try accessing this invitation again</li>
                </>
              )}
              {isProcessedError && (
                <li>This invitation has already been used, check your hubs dashboard</li>
              )}
              {isNoInvitationsError && (
                <>
                  <li>Verify you are using the correct email address</li>
                  <li>Contact the hub administrator to resend the invitation</li>
                </>
              )}
              {!isEmailMismatchError && !isNoInvitationsError && (
                <li>Make sure you are signed in with the correct account</li>
              )}
              <li>Contact the hub administrator for assistance</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {isEmailMismatchError ? (
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="flex items-center gap-1 w-full justify-center"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <>
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
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
