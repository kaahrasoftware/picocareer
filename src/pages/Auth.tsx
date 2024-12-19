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
    // Check if user is already logged in and listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
      
      // Handle auth errors
      if (event === 'USER_ERROR') {
        toast({
          title: "Account already exists",
          description: "Please sign in instead or use a different email address.",
          variant: "destructive",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
          localization={{
            variables: {
              sign_up: {
                email_label: "Email",
                password_label: "Password",
                email_input_placeholder: "Your email address",
                password_input_placeholder: "Your password",
                button_label: "Sign up",
                loading_button_label: "Signing up ...",
                social_provider_text: "Sign in with {{provider}}",
                link_text: "Don't have an account? Sign up",
                confirmation_text: "Check your email for the confirmation link",
              },
            },
          }}
          view="sign_up"
        />
      </div>
    </div>
  );
}