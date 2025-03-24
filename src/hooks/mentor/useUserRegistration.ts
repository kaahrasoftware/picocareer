
import { supabase } from "@/integrations/supabase/client";

export function useUserRegistration() {
  const registerNewUser = async (data: any) => {
    console.log('Registering new user with data:', {
      email: data.email,
      password: data.password
    });

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      console.error('Auth signup error:', signUpError);
      throw signUpError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user account");
    }

    console.log('User signed up successfully:', authData.user.id);
    
    return authData.user;
  };

  return { registerNewUser };
}
