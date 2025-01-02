import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get("token");
        const type = searchParams.get("type");

        if (!token || !type) {
          setIsSuccess(false);
          setIsVerifying(false);
          return;
        }

        // Verify the email
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });

        if (error) {
          console.error("Verification error:", error);
          toast({
            title: "Verification Failed",
            description: error.message,
            variant: "destructive",
          });
          setIsSuccess(false);
        } else {
          setIsSuccess(true);
          toast({
            title: "Email Verified",
            description: "Your email has been successfully verified.",
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  const handleLogin = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          {isVerifying ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-picocareer-primary" />
              <p className="text-lg">Verifying your email...</p>
            </div>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold">Email Verified!</h1>
              <p className="text-muted-foreground">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-muted-foreground">
                We couldn't verify your email. The link may have expired or is invalid.
                Please try signing up again or contact support if the problem persists.
              </p>
            </>
          )}

          <Button
            onClick={handleLogin}
            className="w-full mt-6"
            variant={isSuccess ? "default" : "secondary"}
          >
            {isSuccess ? "Sign In" : "Back to Sign Up"}
          </Button>
        </div>
      </Card>
    </div>
  );
}