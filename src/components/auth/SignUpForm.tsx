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
      // Validate form data
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide both first name and last name",
          variant: "destructive",
        });
        return;
      }

      // First check if user exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Account Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setTimeout(() => {
          navigate("/auth?tab=signin");
        }, 1500);
        return;
      }

      // Attempt to sign up
      const signUpResponse = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (signUpResponse.error) {
        console.error('Sign up error:', signUpResponse.error);
        
        if (signUpResponse.error.message.includes("User already registered")) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/auth?tab=signin");
          }, 1500);
        } else if (signUpResponse.error.message.includes("password")) {
          toast({
            title: "Invalid Password",
            description: "Password must be at least 6 characters long",
            variant: "destructive",
          });
        } else if (signUpResponse.error.message.includes("email")) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: signUpResponse.error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (signUpResponse.data.user) {
        toast({
          title: "Success! 🎉",
          description: "Your account has been created. Please check your email to verify your account.",
        });

        setTimeout(() => {
          navigate("/auth?tab=signin");
        }, 1500);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
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