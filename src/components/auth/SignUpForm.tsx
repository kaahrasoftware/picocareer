
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialSignIn } from "./SocialSignIn";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift } from "lucide-react";

export function SignUpForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  // Check for referral code from URL
  useEffect(() => {
    const urlReferralCode = searchParams.get('ref');
    if (urlReferralCode) {
      console.log('Setting referral code from URL:', urlReferralCode);
      setReferralCode(urlReferralCode);
      
      // Clean up the URL to remove the ref parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      // First, check if email already exists
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

      console.log('Starting signup process with referral code:', referralCode);

      // Proceed with signup, including referral code in metadata
      const signUpData: any = {
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      };

      // Add referral code to metadata if present
      if (referralCode) {
        signUpData.options.data.referral_code = referralCode;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp(signUpData);

      if (signUpError) {
        setIsLoading(false);
        console.error('Signup error:', signUpError);
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

      console.log('Signup successful:', authData.user?.id);

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
    <div className="space-y-4">
      {referralCode && (
        <Alert className="border-green-200 bg-green-50">
          <Gift className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            🎉 You've been referred by a friend! Complete your registration and you'll both get 15 tokens!
          </AlertDescription>
        </Alert>
      )}

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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        <SocialSignIn />
      </form>
    </div>
  );
}
