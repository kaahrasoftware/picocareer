
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Safeguard against empty credentials
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Clear any previous auth sessions first to prevent conflicts
      await supabase.auth.signOut();
      
      // Add a small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      // Clear existing queries to ensure fresh data
      queryClient.clear();
      
      // Refresh auth session data
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Navigate after a brief delay to ensure session is fully established
      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (error) {
      if (error instanceof AuthError) {
        const errorMessage = error.message || "Failed to sign in";
        console.error('Auth error details:', error);
        
        // Provide user-friendly error messages
        if (errorMessage.includes("rate limit")) {
          toast({
            title: "Too many attempts",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("Invalid login credentials")) {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        console.error('Unexpected sign in error:', error);
        toast({
          title: "Sign in failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
}
