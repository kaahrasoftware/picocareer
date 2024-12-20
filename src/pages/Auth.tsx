import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AuthError } from "@supabase/supabase-js";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
        navigate("/");
      }

      if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "Come back soon!",
        });
      }

      if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Password recovery initiated",
          description: "Check your email for the recovery link.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleError = (error: AuthError) => {
    let description = error.message;
    if (error.message.includes("invalid_credentials")) {
      description = "Invalid email or password. Please try again.";
    }
    toast({
      title: "Authentication error",
      description,
      variant: "destructive",
    });
  };

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-8 rounded-lg border border-border/50">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                },
              },
            },
          }}
          providers={["google", "github"]}
          redirectTo={`${window.location.origin}/auth/callback`}
          onError={handleError}
        />
      </div>
    </div>
  );
}