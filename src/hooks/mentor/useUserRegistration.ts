
import { supabase } from "@/integrations/supabase/client";

export function useUserRegistration() {
  const registerNewUser = async (data: any) => {
    console.log('Registering new user with data:', {
      email: data.email,
      password: data.password ? '********' : 'missing' // Mask password in logs
    });

    try {
      // Get referral code from localStorage if available
      const referralCode = localStorage.getItem('referralCode');
      
      console.log('Mentor registration with referral code:', referralCode);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            user_type: 'mentor',
            referral_code: referralCode || null
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

      console.log('User signed up successfully:', {
        userId: authData.user.id,
        referralCode: referralCode,
        userMetadata: authData.user.user_metadata
      });
      
      // Clear referral code from localStorage after successful signup
      if (referralCode) {
        localStorage.removeItem('referralCode');
      }
      
      return authData.user;
    } catch (error) {
      console.error('Error in registerNewUser:', error);
      throw error;
    }
  };

  return { registerNewUser };
}
