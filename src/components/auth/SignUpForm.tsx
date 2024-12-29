import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PersonalInfoFields } from "./signup/PersonalInfoFields";
import { SocialSignIn } from "./signup/SocialSignIn";

export function SignUpForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      // Basic form validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide both first name and last name",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!formData.password || formData.password.length < 6) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Attempt to sign up without redirect URL
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        
        if (signUpError.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/auth?tab=signin");
          }, 1500);
        } else if (signUpError.message.toLowerCase().includes("password")) {
          toast({
            title: "Invalid Password",
            description: "Password must be at least 6 characters long and meet security requirements",
            variant: "destructive",
          });
        } else if (signUpError.message.toLowerCase().includes("email")) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: signUpError.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (signUpData.user) {
        // Show success message
        toast({
          title: "Success! 🎉",
          description: "Your account has been created. Please check your email to verify your account.",
        });

        // Clear form data
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
        });

        // Redirect to sign in page after a short delay
        setTimeout(() => {
          navigate("/auth?tab=signin");
        }, 1500);
      }
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <PersonalInfoFields
        {...formData}
        onChange={handleInputChange}
        hasError={{
          firstName: !formData.firstName.trim(),
          lastName: !formData.lastName.trim()
        }}
      />
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <SocialSignIn onGoogleSignIn={handleGoogleSignIn} />
    </form>
  );
}