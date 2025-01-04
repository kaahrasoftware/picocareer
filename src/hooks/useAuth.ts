import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        if (error.message === "Email not confirmed") {
          toast({
            title: "Email not verified",
            description: "Please check your email for the verification link.",
            variant: "destructive",
          });
          return;
        }

        if (error.message === "Invalid login credentials") {
          toast({
            title: "Invalid credentials",
            description: "Please check your email and password.",
            variant: "destructive",
          });
          return;
        }

        if (error.message.includes("rate limit")) {
          toast({
            title: "Too many attempts",
            description: "Please try again later.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Error",
          description: "An error occurred while signing in.",
          variant: "destructive",
        });
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
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
  };
}