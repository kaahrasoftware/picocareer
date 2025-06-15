
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialSignIn } from "./SocialSignIn";

interface SignUpFormProps {
  referralCode?: string | null;
}

interface ReferralResponse {
  success: boolean;
  message?: string;
  reward_amount?: number;
  referrer_id?: string;
}

export function SignUpForm({ referralCode }: SignUpFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const processReferralReward = async (userId: string, retryCount = 0): Promise<void> => {
    if (!referralCode) return;

    try {
      console.log('Processing referral reward for user:', userId, 'with code:', referralCode, 'attempt:', retryCount + 1);
      
      // Add a small delay to ensure profile is created
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const { data, error } = await supabase.rpc('process_referral_reward', {
        p_referred_id: userId,
        p_referral_code: referralCode
      });

      if (error) {
        console.error('Error processing referral reward:', error);
        
        // Retry once if it's a timing issue
        if (retryCount === 0 && error.message.includes('not found')) {
          console.log('Retrying referral processing...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return processReferralReward(userId, retryCount + 1);
        }
        return;
      }

      const response = data as ReferralResponse;
      
      if (response?.success) {
        console.log('Referral reward processed successfully:', response);
        toast({
          title: "Referral processed!",
          description: "Your friend has been rewarded for referring you. Welcome to PicoCareer!",
        });
        
        // Clear the referral code from localStorage
        localStorage.removeItem('referralCode');
      } else {
        console.log('Referral reward not processed:', response?.message);
        
        // Retry once for any failure on first attempt
        if (retryCount === 0) {
          console.log('Retrying referral processing due to failure...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return processReferralReward(userId, retryCount + 1);
        }
      }
    } catch (error) {
      console.error('Error in referral processing:', error);
      
      // Retry once for any error on first attempt
      if (retryCount === 0) {
        console.log('Retrying referral processing due to error...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return processReferralReward(userId, retryCount + 1);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, check if email already exists using maybeSingle() instead of single()
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email.toLowerCase())
        .maybeSingle();

      if (profileError) {
        setIsLoading(false);
        console.error('Error checking existing profile:', profileError);
        toast({
          title: "Error",
          description: "An error occurred while checking your email. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingProfile) {
        setIsLoading(false);
        toast({
          title: "Account already exists",
          description: "Please sign in instead.",
          variant: "destructive",
        });
        return;
      }

      // Proceed with signup
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            referral_code: referralCode || null, // Store referral code in user metadata
          },
        },
      });

      if (signUpError) {
        setIsLoading(false);
        if (signUpError.message.includes("Password")) {
          toast({
            title: "Invalid password",
            description: "Password should be at least 6 characters long.",
            variant: "destructive",
          });
          return;
        }
        throw signUpError;
      }

      // Process referral reward if user signed up and we have their ID
      if (authData.user?.id && referralCode) {
        // Process referral reward asynchronously to not block the signup flow
        processReferralReward(authData.user.id).catch(error => {
          console.error('Failed to process referral reward:', error);
        });
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link. Please check your spam folder if you don't see it.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signup-firstName">First Name</Label>
          <Input
            id="signup-firstName"
            name="firstName"
            type="text"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-lastName">Last Name</Label>
          <Input
            id="signup-lastName"
            name="lastName"
            type="text"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
        <Input
          id="signup-confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          minLength={6}
        />
      </div>

      {referralCode && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            🎁 Referral Code: <span className="font-mono font-semibold">{referralCode}</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Your friend will receive tokens when you complete registration!
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <SocialSignIn />
    </form>
  );
}
