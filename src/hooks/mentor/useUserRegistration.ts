
import { supabase } from "@/integrations/supabase/client";

export function useUserRegistration() {
  const registerNewUser = async (data: any) => {
    console.log('Registering new user with data:', {
      email: data.email,
      password: data.password ? '********' : 'missing' // Mask password in logs
    });

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            user_type: 'mentor'
          }
        }
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        
        // Transform auth errors into user-friendly messages
        if (signUpError.message.includes('password')) {
          throw new Error("Password does not meet requirements. Please ensure it has at least 8 characters including lowercase, uppercase, and numbers.");
        } else if (signUpError.message.includes('email')) {
          throw new Error("Invalid email address or email already in use.");
        } else {
          throw signUpError;
        }
      }

      if (!authData.user) {
        throw new Error("Failed to create user account. No response from authentication service.");
      }

      console.log('User signed up successfully:', authData.user.id);
      
      return authData.user;
    } catch (error) {
      console.error('Error in registerNewUser:', error);
      throw error;
    }
  };

  return { registerNewUser };
}
