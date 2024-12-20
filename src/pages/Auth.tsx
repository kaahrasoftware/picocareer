import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Signed in",
          description: "You have been signed in successfully.",
        });
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        });
      } else if (event === "USER_UPDATED") {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Password recovery",
          description: "Check your email for password reset instructions.",
        });
      }
    });

    // Handle auth error events
    const handleAuthError = (error: Error) => {
      console.error('Auth error:', error);
      
      if (error.message.includes('invalid_credentials')) {
        toast({
          variant: "destructive",
          title: "Invalid credentials",
          description: "Please check your email and password and try again.",
        });
      } else if (error.message.includes('Email not confirmed')) {
        toast({
          variant: "destructive",
          title: "Email not confirmed",
          description: "Please check your email and confirm your account before signing in.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "An error occurred during authentication. Please try again.",
        });
      }
    };

    // Subscribe to auth events
    const {
      data: { subscription: errorSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_DELETED') {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully.",
        });
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
      errorSubscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="container max-w-lg mx-auto p-8">
      <SupabaseAuth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["google", "github"]}
        redirectTo={`${window.location.origin}/auth/callback`}
      />
    </div>
  );
}