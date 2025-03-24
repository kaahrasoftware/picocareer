
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, throttledAuthOperation } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { useAuth as useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useAuthContext();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Use throttled operation to prevent rate limiting
      const { data, error } = await throttledAuthOperation(async () => {
        return await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      return data;
    } catch (error) {
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
    signOut: authContext.signOut,
    user: authContext.user,
    session: authContext.session,
  };
}
