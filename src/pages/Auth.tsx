import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleError = (error: Error) => {
    console.error('Auth error:', error);
    
    if (error.message.includes('User already registered')) {
      toast({
        title: "Account already exists",
        description: "Please sign in instead or use a different email address.",
        variant: "destructive",
      });
    } else if (error.message.includes('Invalid login credentials')) {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Authentication error",
        description: "An error occurred during authentication. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
            }
          }}
          theme="dark"
          providers={["google", "github"]}
          redirectTo={window.location.origin}
          localization={{
            variables: {
              sign_up: {
                email_label: "Email",
                password_label: "Password",
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