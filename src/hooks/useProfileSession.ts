
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useProfileSession() {
  const { session, user, loading, error: sessionError } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return { 
    session, 
    user,
    loading,
    sessionError, 
    queryClient 
  };
}
