
import { supabase } from "@/integrations/supabase/client";
import { useReferralProcessor } from "@/hooks/useReferralProcessor";

export function useUserRegistration() {
  const { processReferralCode } = useReferralProcessor();

  const registerNewUser = async (data: any) => {
    console.log('Registering new user with data:', {
      email: data.email,
      password: data.password ? '********' : 'missing'
    });

    try {
      // Get referral code from localStorage if available
      const referralCode = localStorage.getItem('referralCode');
      
      console.log('Mentor registration, referral code available:', !!referralCode);

      // Simplified signup without referral code in metadata
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
      
      // Process referral code after successful signup
      if (referralCode) {
        console.log('Processing referral code for mentor signup');
        
        // Small delay to ensure user is fully created
        setTimeout(async () => {
          try {
            await processReferralCode(referralCode);
          } catch (error) {
            console.error('Referral processing failed for mentor, but signup was successful:', error);
            // Don't block signup if referral processing fails
          }
        }, 2000);
      }
      
      return authData.user;
    } catch (error) {
      console.error('Error in registerNewUser:', error);
      throw error;
    }
  };

  return { registerNewUser };
}
