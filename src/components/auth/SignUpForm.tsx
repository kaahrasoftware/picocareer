
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialSignIn } from "./SocialSignIn";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, User, Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function SignUpForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { signUp, isLoading } = useAuth();
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

    const metadata: {
      first_name: string;
      last_name: string;
      referral_code?: string;
    } = {
      first_name: formData.firstName,
      last_name: formData.lastName,
    };

    // Add referral code to metadata if present
    if (referralCode) {
      metadata.referral_code = referralCode;
    }

    const { data, error } = await signUp(formData.email, formData.password, metadata);
    
    if (!error && data) {
      navigate("/");
    }
  };

  return (
    <div className="space-y-6">
      {referralCode && (
        <Alert className="border-green-200 bg-green-50">
          <Gift className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 You've been referred by a friend! Complete your registration and you'll both get 15 tokens!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="signup-firstName" className="text-sm font-medium text-gray-700">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="signup-firstName"
                name="firstName"
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="pl-10 h-12 border-gray-200 focus:border-[#00A6D4] focus:ring-[#00A6D4] transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-lastName" className="text-sm font-medium text-gray-700">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="signup-lastName"
                name="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="pl-10 h-12 border-gray-200 focus:border-[#00A6D4] focus:ring-[#00A6D4] transition-colors"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="pl-10 h-12 border-gray-200 focus:border-[#00A6D4] focus:ring-[#00A6D4] transition-colors"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="pl-10 h-12 border-gray-200 focus:border-[#00A6D4] focus:ring-[#00A6D4] transition-colors"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-confirmPassword" className="text-sm font-medium text-gray-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="signup-confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength={6}
              className="pl-10 h-12 border-gray-200 focus:border-[#00A6D4] focus:ring-[#00A6D4] transition-colors"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-[#00A6D4] hover:bg-[#0EA5E9] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>

        <SocialSignIn />
      </form>
    </div>
  );
}
