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

  const createProfile = async (userId: string, email: string, firstName: string, lastName: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        const { error } = await supabase.from('profiles').insert({
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          user_type: 'mentee'
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // First, check if the email already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (existingUser?.user) {
        toast({
          title: "Error",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth?tab=signin`
        }
      });

      if (error) {
        if (error.message.includes("confirmation email")) {
          toast({
            title: "Email Service Error",
            description: "We're experiencing issues with our email service. Please try again later or contact support.",
            variant: "destructive",
          });
          console.error('Email service error:', error);
          return;
        }
        throw error;
      }

      if (data.user) {
        await createProfile(
          data.user.id,
          formData.email,
          formData.firstName,
          formData.lastName
        );

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in.",
        });

        // Navigate to sign-in tab
        navigate("/auth?tab=signin");
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('password')) {
        toast({
          title: "Password Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
      } else if (errorMessage.includes('email')) {
        toast({
          title: "Email Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
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

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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