import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function EmailConfirmation() {
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast({
            title: "Verification Error",
            description: "There was an error verifying your email. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (session?.user?.email_confirmed_at) {
          setIsVerifying(false);
          toast({
            title: "Success!",
            description: "Your email has been verified successfully.",
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight">Email Verified!</h1>
        
        <p className="text-gray-600">
          Thank you for verifying your email address. You can now sign in to your account.
        </p>

        <div className="pt-4">
          <Button
            asChild
            className="w-full bg-picocareer-primary hover:bg-picocareer-accent"
          >
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}