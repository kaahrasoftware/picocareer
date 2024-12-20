import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        });
      } else if (event === 'USER_UPDATED') {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "Password recovery email sent",
          description: "Check your email for the password reset link.",
        });
      }
    }, (error: AuthError) => {
      // Handle authentication errors
      toast({
        title: "Authentication Error",
        description: error.message || "There was an error during authentication. Please try again.",
        variant: "destructive",
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Welcome to PicoCareer</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--picocareer-primary))',
                  brandAccent: 'rgb(var(--picocareer-primary) / 0.8)',
                }
              }
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
            }
          }}
          theme="dark"
          providers={["google", "github"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          localization={{
            variables: {
              sign_up: {
                email_label: "Email",
                password_label: "Password (minimum 6 characters)",
                button_label: "Sign up",
                loading_button_label: "Signing up...",
                social_provider_text: "Sign up with {{provider}}",
                link_text: "Don't have an account? Sign up",
              },
              sign_in: {
                email_label: "Email",
                password_label: "Password",
                button_label: "Sign in",
                loading_button_label: "Signing in...",
                social_provider_text: "Sign in with {{provider}}",
                link_text: "Already have an account? Sign in",
              },
            },
          }}
        />
      </div>
    </div>
  );
}