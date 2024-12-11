import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { theme } = useTheme();
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-y-auto max-h-[90vh]">
        <div className="flex flex-col items-center p-4">
          <img 
            src="/lovable-uploads/6acdf1f4-1127-4008-b833-3b68780f1741.png" 
            alt="Kahra Logo" 
            className="w-16 h-16 mb-2"
          />
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold mb-1">Welcome to Kahra!</h2>
            <p className="text-muted-foreground text-sm">
              We're the tool that helps you prepare for a career with the right education and skills.
            </p>
          </div>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(147, 51, 234)',
                  brandAccent: 'rgb(126, 34, 206)',
                  inputBackground: 'transparent',
                  inputText: theme === 'dark' ? 'white' : 'black',
                  inputBorder: theme === 'dark' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)',
                  inputBorderFocus: 'rgb(147, 51, 234)',
                  inputBorderHover: 'rgb(147, 51, 234)',
                  inputPlaceholder: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                }
              }
            },
            style: {
              container: {
                padding: '16px',
              },
              button: {
                borderRadius: '0.5rem',
                height: '2.5rem',
                backgroundColor: '#8B5CF6',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
              },
              input: {
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'transparent',
                height: '2.5rem',
                fontSize: '0.875rem',
              },
              message: {
                padding: '0.25rem 0',
                fontSize: '0.875rem',
              },
              anchor: {
                color: '#DC2626',
                fontSize: '0.875rem',
              },
              divider: {
                margin: '1rem 0',
              },
            },
          }}
          theme={theme === 'dark' ? 'dark' : 'light'}
          redirectTo={window.location.origin}
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: error.message,
            });
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email Address',
                password_label: 'Password',
                button_label: 'Login',
                loading_button_label: 'Signing in...',
                link_text: "Don't have an account? Sign Up",
              },
              sign_up: {
                email_label: 'Email Address',
                password_label: 'Password',
                button_label: 'Register',
                loading_button_label: 'Signing up...',
                link_text: 'Already have an account? Login',
              },
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}