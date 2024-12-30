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

  const validatePassword = (password: string) => {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasLowerCase && hasUpperCase && hasNumber;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    // Password validation
    if (!validatePassword(formData.password)) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one lowercase letter, one uppercase letter, and one number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if a profile with this email already exists
      const { data: existingProfiles, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email.toLowerCase());

      if (profileCheckError) {
        console.error('Error checking existing profile:', profileCheckError);
        throw new Error("Failed to check existing profile");
      }

      if (existingProfiles && existingProfiles.length > 0) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        navigate("/auth?tab=signin");
        return;
      }

      // Attempt the signup
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
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
        throw signUpError;
      }

      if (!authData.user?.id) {
        throw new Error("Failed to create account");
      }

      // Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email.toLowerCase(),
          first_name: formData.firstName,
          last_name: formData.lastName,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw new Error("Failed to create profile");
      }

      toast({
        title: "Success",
        description: "Please check your email (including spam folder) to verify your account before signing in.",
      });
      
      navigate("/auth?tab=signin");

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
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

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
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
          lastName: !formData.lastName.trim(),
          password: !validatePassword(formData.password)
        }}
      />
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        You'll need to verify your email address before signing in.
      </p>

      <SocialSignIn onGoogleSignIn={handleGoogleSignIn} />
    </form>
  );
}