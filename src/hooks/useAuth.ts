
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
    if (isLoading) return; // Prevent multiple concurrent sign-in attempts
    
    setIsLoading(true);
    console.log('Attempting sign in for:', email);

    try {
      // Use direct auth operation for better reliability
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      // First ensure the session is properly stored
      if (data.session) {
        await supabase.auth.setSession(data.session);
        
        // Then invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['profile', data.session.user.id] });
        queryClient.invalidateQueries({ queryKey: ['notifications', data.session.user.id] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        
        console.log('Sign in successful, navigating to home');
        
        // Show success toast after a small delay to ensure UI has updated
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        // Navigate to home after successful login
        navigate('/');
      }

      return data;
    } catch (error) {
      console.error('Sign in error details:', error);
      
      if (error instanceof AuthError) {
        // Handle specific auth errors
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
        throw error;
      } else {
        console.error('Sign in error:', error);
        toast({
          title: "Login error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        throw new Error("An unexpected error occurred.");
      }
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
