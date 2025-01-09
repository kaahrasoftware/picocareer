import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);

    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Invalid credentials",
              description: "Please check your email and password.",
              variant: "destructive",
            });
            return;
          }
          if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not verified",
              description: "Please check your email for the verification link.",
              variant: "destructive",
            });
            return;
          }
          break;
        case 429:
          toast({
            title: "Too many attempts",
            description: "Please try again later.",
            variant: "destructive",
          });
          return;
        default:
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
      }
    } else {
      toast({
        title: "Connection Error",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        handleAuthError(error);
        return;
      }

      // Invalidate all queries to force a refresh of data
      await queryClient.invalidateQueries();

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Add a small delay to ensure the auth state is updated
      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error: any) {
      console.error('Sign in error:', error);
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
}