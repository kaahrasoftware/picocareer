import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useToast } from "@/hooks/use-toast";
import { AuthDialogHeader } from "./auth/AuthDialogHeader";
import { SignUpForm } from "./auth/SignUpForm";
import { Separator } from "./ui/separator";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeForm, setActiveForm] = useState<'mentee' | 'mentor'>('mentee');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    position: "",
    userType: "student"
  });
  const lastCheckRef = React.useRef<number>(0);
  const CHECK_INTERVAL = 600000; // 10 minutes interval
  const DEBOUNCE_DELAY = 5000; // 5 seconds debounce

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          position: formData.position,
          user_type: formData.userType,
          intended_user_type: activeForm
        }
      }
    });

    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isComponentMounted = true;
    
    const checkSession = async () => {
      const now = Date.now();
      if (!isComponentMounted || isRefreshing || now - lastCheckRef.current < CHECK_INTERVAL) {
        return;
      }

      try {
        setIsRefreshing(true);
        lastCheckRef.current = now;
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check failed:', error);
          return;
        }
        
        if (session && isComponentMounted) {
          onOpenChange(false);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        timeoutId = setTimeout(() => {
          if (isComponentMounted) {
            setIsRefreshing(false);
          }
        }, DEBOUNCE_DELAY);
      }
    };

    const handleAuthChange = (event: string, session: any) => {
      if (!isComponentMounted) return;

      if (event === 'SIGNED_IN') {
        onOpenChange(false);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    const initialCheckTimeout = setTimeout(checkSession, 5000);
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      isComponentMounted = false;
      if (subscription) subscription.unsubscribe();
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      clearTimeout(initialCheckTimeout);
    };
  }, [onOpenChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <AuthDialogHeader isSignUp={isSignUp} />

        {isSignUp ? (
          <SignUpForm
            formData={formData}
            onFormDataChange={(newData) => setFormData({ ...formData, ...newData })}
            onSubmit={handleSignUp}
            onSignInClick={() => setIsSignUp(false)}
          />
        ) : (
          <div className="flex gap-8">
            {/* Mentee Sign In Form */}
            <div className="flex-1 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">I'm a mentee</h3>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'rgb(14, 165, 233)',
                        brandAccent: 'rgb(0, 35, 102)',
                      },
                    },
                  },
                }}
                providers={[]}
                view="sign_in"
                localization={{
                  variables: {
                    sign_in: {
                      button_label: "Sign in as Mentee"
                    }
                  }
                }}
                onlyThirdPartyProviders={false}
              />
            </div>

            <Separator orientation="vertical" />

            {/* Mentor Sign In Form */}
            <div className="flex-1 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">I'm a mentor</h3>
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: 'rgb(14, 165, 233)',
                        brandAccent: 'rgb(0, 35, 102)',
                      },
                    },
                  },
                }}
                providers={[]}
                view="sign_in"
                localization={{
                  variables: {
                    sign_in: {
                      button_label: "Sign in as Mentor"
                    }
                  }
                }}
                onlyThirdPartyProviders={false}
              />
            </div>
          </div>
        )}

        {!isSignUp && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className="text-primary hover:underline"
            >
              Sign Up
            </button>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}