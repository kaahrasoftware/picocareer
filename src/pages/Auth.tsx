import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProfile = async (userId: string, email: string) => {
    try {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error } = await supabase.from('profiles').insert({
          id: userId,
          email: email,
          user_type: 'mentee'
        });

        if (error) {
          console.error('Error creating profile:', error);
          toast({
            title: "Profile Creation Failed",
            description: "There was an error creating your profile. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    }
  };

  useEffect(() => {
    // Clear any existing session and local storage data on mount
    const clearSession = async () => {
      try {
        localStorage.removeItem('supabase.auth.token');
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    };
    clearSession();

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        try {
          // Try to create profile when user signs in
          await createProfile(session.user.id, session.user.email || '');
          
          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
          navigate("/");
        } catch (error) {
          console.error('Error during sign in:', error);
          toast({
            title: "Error",
            description: "There was an error during sign in. Please try again.",
            variant: "destructive",
          });
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear any cached data
        localStorage.removeItem('supabase.auth.token');
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-center mb-6">Welcome to PicoCareer</h1>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0EA5E9',
                  brandAccent: '#002366',
                  brandButtonText: 'white',
                }
              }
            }
          }}
          theme="dark"
          providers={["google"]}
          redirectTo={window.location.origin}
          showLinks={true}
          view="sign_up"
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
          additionalData={{
            first_name: {
              required: true,
              label: "First Name",
              type: "text",
            },
            last_name: {
              required: true,
              label: "Last Name",
              type: "text",
            },
          }}
        />
      </div>
    </div>
  );
}