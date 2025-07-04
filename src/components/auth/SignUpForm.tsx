
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialSignIn } from "./SocialSignIn";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift } from "lucide-react";
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

    const metadata = {
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
