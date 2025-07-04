
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('Sign in successful:', data.user?.id);
      
      // Show success message
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      // Force a page refresh to ensure proper state initialization
      setTimeout(() => {
        window.location.href = '/';
      }, 500);

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      let errorMessage = "An error occurred during sign in.";
      
      if (error instanceof AuthError) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many login attempts. Please wait a moment before trying again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      console.log('Sign up successful:', data.user?.id);
      
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = "An error occurred during sign up.";
      
      if (error instanceof AuthError) {
        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "Password should be at least 6 characters long.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    isLoading,
  };
}
