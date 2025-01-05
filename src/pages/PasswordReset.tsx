import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    
    if (!code) {
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      navigate("/auth?tab=signin");
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the code from URL parameters
      const code = searchParams.get("code");
      
      if (!code) {
        throw new Error("Reset code is missing");
      }

      // First verify the recovery code
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token: code,
        type: 'recovery'
      });

      if (verifyError) throw verifyError;

      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      toast({
        title: "Password Reset Successful",
        description: "Your password has been successfully reset. Please sign in with your new password.",
      });

      setTimeout(() => {
        navigate("/auth?tab=signin");
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error Resetting Password",
        description: error.message || "An error occurred while resetting your password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}