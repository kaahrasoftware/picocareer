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
      <DialogContent className="sm:max-w-[400px]">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(147, 51, 234)',
                  brandAccent: 'rgb(126, 34, 206)',
                }
              }
            },
            style: {
              button: {
                borderRadius: '0.5rem',
                height: '2.5rem',
              },
              input: {
                borderRadius: '0.5rem',
              },
            },
          }}
          theme={theme === 'dark' ? 'dark' : 'light'}
          providers={[]}
        />
      </DialogContent>
    </Dialog>
  );
}