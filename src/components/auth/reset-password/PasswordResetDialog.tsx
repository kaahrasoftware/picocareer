import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordResetDialog({ open, onOpenChange }: PasswordResetDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?tab=signin`,
      });

      if (error) {
        console.error('Password reset error:', error);
        
        // Handle specific error cases
        if (error.message.includes("Email rate limit exceeded")) {
          toast({
            title: "Too Many Attempts",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not found")) {
          toast({
            title: "Email Not Found",
            description: "No account found with this email address.",
            variant: "destructive",
          });
        } else if (error.status === 500) {
          toast({
            title: "Service Temporarily Unavailable",
            description: "We're experiencing technical difficulties. Please try again later.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password Reset Failed",
            description: "Please try again later or contact support if the problem persists.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Check Your Email",
        description: "If an account exists with this email, you'll receive password reset instructions.",
      });
      onOpenChange(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you instructions to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}