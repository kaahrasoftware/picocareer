import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useTheme } from "next-themes";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-y-auto max-h-[90vh]">
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
              // Add styles for the links container
              links: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
              },
            },
          }}
          theme={theme === 'dark' ? 'dark' : 'light'}
          providers={[]}
          redirectTo={window.location.origin}
          socialLayout="horizontal"
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email Address',
                password_label: 'Password',
                button_label: 'Login',
                loading_button_label: 'Signing in...',
                link_text: '',
              },
              sign_up: {
                email_label: 'Email Address',
                password_label: 'Password',
                button_label: 'Sign Up',
                loading_button_label: 'Signing up...',
                link_text: '',
              },
              forgotten_password: {
                email_label: 'Email Address',
                button_label: 'Send Reset Instructions',
                loading_button_label: 'Sending reset instructions...',
                link_text: '',
              },
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}