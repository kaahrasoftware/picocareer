import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkSession = async () => {
      if (isRefreshing) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        onOpenChange(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        onOpenChange(false);
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      } else if (event === 'TOKEN_REFRESHED') {
        setIsRefreshing(false);
      }
    });

    // Check session less frequently
    timeoutId = setInterval(checkSession, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(timeoutId);
    };
  }, [onOpenChange, toast, isRefreshing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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