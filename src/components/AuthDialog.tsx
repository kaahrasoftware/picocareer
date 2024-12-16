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
  const CHECK_INTERVAL = 300000; // 5 minutes interval
  const DEBOUNCE_DELAY = 2000; // 2 seconds debounce

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isComponentMounted = true;
    
    const checkSession = async () => {
      const now = Date.now();
      // Prevent checking if component unmounted, already refreshing, or if it's too soon
      if (!isComponentMounted || isRefreshing || now - lastCheckRef.current < CHECK_INTERVAL) {
        return;
      }

      try {
        setIsRefreshing(true);
        lastCheckRef.current = now;
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isComponentMounted) {
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        // Debounce the refresh state reset
        clearTimeout(timeoutId);
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

    // Initial check with delay to prevent immediate rate limiting
    const initialCheckTimeout = setTimeout(checkSession, 1000);

    // Set up interval with a longer delay
    const intervalId = setInterval(checkSession, CHECK_INTERVAL);

    return () => {
      isComponentMounted = false;
      subscription.unsubscribe();
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      clearTimeout(initialCheckTimeout);
    };
  }, [onOpenChange, toast]);

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