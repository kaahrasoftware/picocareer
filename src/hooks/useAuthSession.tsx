
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Session, User, AuthError } from "@supabase/supabase-js";

// Create a context for authentication state
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      // Update the query cache with the session
      if (data.session) {
        queryClient.setQueryData(['auth-session'], data.session);
        setUser(data.session.user);
      } else {
        queryClient.setQueryData(['auth-session'], null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      queryClient.setQueryData(['auth-session'], null);
      setUser(null);
    }
  };

  // Handle sign in
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Safeguard against empty credentials
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Add a small delay to prevent rate limiting
      const delayPromise = new Promise(resolve => setTimeout(resolve, 500));
      await delayPromise;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.user?.id] });

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Navigate after a brief delay to ensure session is fully established
      setTimeout(() => {
        navigate("/");
      }, 300);
    } catch (error) {
      console.error('Sign in error:', error);
      
      if (error instanceof AuthError || (error as any).message) {
        const errorMessage = (error as any).message || "Failed to sign in";
        
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

  // Handle sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      queryClient.setQueryData(['auth-session'], null);
      queryClient.removeQueries({ queryKey: ['profile'] });
      queryClient.removeQueries({ queryKey: ['notifications'] });
      setUser(null);
      navigate("/auth");
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
          queryClient.setQueryData(['auth-session'], newSession);
          setUser(newSession?.user || null);
          queryClient.invalidateQueries({ queryKey: ['profile', newSession?.user?.id] });
        } 
        else if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(['auth-session'], null);
          queryClient.removeQueries({ queryKey: ['profile'] });
          queryClient.removeQueries({ queryKey: ['notifications'] });
          setUser(null);
        }
        else if (event === 'TOKEN_REFRESHED') {
          if (newSession) {
            queryClient.setQueryData(['auth-session'], newSession);
            setUser(newSession.user);
          }
        }
      }
    );

    // Initial session check
    refreshSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, queryClient, toast]);

  // Get the current session from cache
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }
        
        return session;
      } catch (error) {
        console.error('Auth session error:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });

  const contextValue: AuthContextType = {
    session,
    user: user || session?.user || null,
    isLoading,
    signIn,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuthSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthSession must be used within an AuthProvider");
  }
  return context;
}

// For backward compatibility - simple hook to get session
export function useSessionOnly() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }
        
        return session;
      } catch (error) {
        console.error('Auth session error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep data in cache for 10 minutes
  });
}
