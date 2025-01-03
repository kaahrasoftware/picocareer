import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Show a welcome toast
    toast({
      title: "Email verified successfully!",
      description: "You can now sign in to your account.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Email Verification Successful!
        </h1>
        <p className="text-muted-foreground">
          Your email has been verified successfully. You can now sign in to your account and access all features.
        </p>
        <div className="space-y-4">
          <Button 
            className="w-full" 
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </Card>
    </div>
  );
}