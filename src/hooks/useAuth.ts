
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { useAuth as useAuthContext } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { session, user, signOut } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Starting sign in process for:', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (data.session) {
        console.log('Sign in successful');
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Navigate to home
        navigate('/');
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      
      if (error instanceof AuthError) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "The email or password you entered is incorrect.",
            variant: "destructive",
          });
        } else if (error.message.includes("rate limit")) {
          toast({
            title: "Too many attempts",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    signOut,
    user,
    session,
    isAuthenticated: !!session?.user,
  };
}
