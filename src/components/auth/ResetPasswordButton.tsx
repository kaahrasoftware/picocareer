import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResetPasswordButtonProps {
  email: string;
}

export function ResetPasswordButton({ email }: ResetPasswordButtonProps) {
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
        redirectTo: `${window.location.origin}/password-reset?type=recovery`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email for password reset instructions. Don't forget to check your spam folder.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific error cases
      if (error.message?.includes("Email rate limit exceeded")) {
        toast({
          title: "Too Many Attempts",
          description: "Please wait a few minutes before requesting another password reset.",
          variant: "destructive",
        });
        return;
      }

      if (error.message?.includes("User not found")) {
        toast({
          title: "Email Not Found",
          description: "No account was found with this email address.",
          variant: "destructive",
        });
        return;
      }

      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      variant="link"
      className="w-full text-sm text-muted-foreground hover:text-primary"
      onClick={handleResetPassword}
    >
      Forgot your password?
    </Button>
  );
}