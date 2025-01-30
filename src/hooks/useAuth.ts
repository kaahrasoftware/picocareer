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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) throw error;

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
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      } else {
        console.error('Sign in error:', error);
        throw new Error("An unexpected error occurred.");
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