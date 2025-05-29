
import { useAuth as useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { session, user, loading, signOut, signIn } = useAuthContext();

  return {
    signIn,
    isLoading: loading,
    signOut,
    user,
    session,
    isAuthenticated: !!session?.user,
  };
}
