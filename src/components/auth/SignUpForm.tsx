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

  const createProfile = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: formData.email.toLowerCase(),
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

    if (error) throw error;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast({
          title: "Error",
          description: "First name and last name are required",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Attempt signup with metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          navigate("/auth?tab=signin");
          return;
        }
        throw error;
      }

      if (data.user) {
        try {
          await createProfile(data.user.id);
          toast({
            title: "Account created!",
            description: "Please check your email (including spam folder) to verify your account before signing in.",
          });
          navigate("/auth?tab=signin");
        } catch (profileError: any) {
          console.error('Profile creation error:', profileError);
          toast({
            title: "Error",
            description: "Account created but profile setup failed. Please try signing in.",
            variant: "destructive",
          });
          navigate("/auth?tab=signin");
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
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
          lastName: !formData.lastName.trim()
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