import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const lastCheckRef = React.useRef<number>(0);
  const CHECK_INTERVAL = 60000; // 1 minute interval
  const DEBOUNCE_DELAY = 1000; // 1 second debounce

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSession = async () => {
      const now = Date.now();
      // Prevent checking if we're already refreshing or if it's too soon
      if (isRefreshing || now - lastCheckRef.current < CHECK_INTERVAL) {
        return;
      }

      try {
        lastCheckRef.current = now;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    const handleAuthChange = async (event: string, session: any) => {
      if (event === 'SIGNED_IN') {
        onOpenChange(false);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      } else if (event === 'TOKEN_REFRESHED') {
        // Debounce the refresh state reset
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsRefreshing(false);
        }, DEBOUNCE_DELAY);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial check
    checkSession();

    // Set up interval with a longer delay
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [onOpenChange, toast, isRefreshing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-4">
          <img
            src="/lovable-uploads/6acdf1f4-1127-4008-b833-3b68780f1741.png"
            alt="Logo"
            className="w-12 h-12"
          />
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-muted-foreground text-center">
            Sign in to continue your journey
          </p>
        </div>
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
        />
      </DialogContent>
    </Dialog>
  );
}