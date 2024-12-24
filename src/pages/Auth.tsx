import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
    // Clear any existing session data on mount
    const clearSession = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
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
      if (event === 'SIGNED_IN' && session) {
        // Try to create profile when user signs in
        await createProfile(session.user.id, session.user.email || '');
        
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      } else if (event === 'SIGNED_OUT') {
        // Clear any cached data
        localStorage.removeItem('supabase.auth.token');
      }
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
                  brand: '#0EA5E9', // Cyan blue from logo
                  brandAccent: '#002366', // Navy blue from logo
                  brandButtonText: 'white',
                }
              }
            }
          }}
          theme="dark"
          providers={["google", "github"]}
          redirectTo={window.location.origin + '/auth'}
        />
      </div>
    </div>
  );
}