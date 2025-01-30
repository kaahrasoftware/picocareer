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

  const handleSessionExpired = () => {
    // Clear all queries from cache
    queryClient.clear();
    
    // Show toast notification
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again.",
      variant: "destructive",
    });

    // Navigate to auth page
    navigate("/auth");
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes('Invalid Refresh Token') || 
            error.message.includes('session_expired')) {
          handleSessionExpired();
          return;
        }
        throw error;
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

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all queries from cache
      queryClient.clear();
      
      // Navigate to auth page
      navigate("/auth");

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    signIn,
    signOut,
    isLoading,
  };
}