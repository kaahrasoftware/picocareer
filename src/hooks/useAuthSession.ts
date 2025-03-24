
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export function useAuthSession() {
  const { session, user, loading, error: sessionError, signOut } = useAuth();
  const queryClient = useQueryClient();

  return {
    session,
    user,
    loading,
    sessionError,
    isError: !!sessionError,
    signOut,
    queryClient
  };
}
