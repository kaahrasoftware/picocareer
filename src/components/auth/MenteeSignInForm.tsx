import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export function MenteeSignInForm() {
  return (
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
        redirectTo={window.location.origin}
        queryParams={{
          user_metadata: JSON.stringify({
            intended_user_type: 'student',
            user_type: 'student'
          })
        }}
      />
    </div>
  );
}