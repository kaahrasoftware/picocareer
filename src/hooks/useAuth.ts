
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";
import { useAuth as useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const authContext = useAuthContext();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

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
    signOut: authContext.signOut,
    user: authContext.user,
    session: authContext.session,
  };
}
