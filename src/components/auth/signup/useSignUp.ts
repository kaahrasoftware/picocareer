import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function useSignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (formData: SignUpFormData) => {
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
        return;
      }

      if (!formData.password || formData.password.length < 6) {
        toast({
          title: "Invalid Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }

      // Attempt to sign up
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
        return;
      }

      if (signUpData.user) {
        toast({
          title: "Success! 🎉",
          description: "Your account has been created. Please check your email to verify your account.",
        });

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

  return {
    isLoading,
    handleSignUp
  };
}