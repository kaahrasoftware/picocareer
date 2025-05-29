
import { useAuth } from '@/context/AuthContext';

export function useAuthSession(mode: 'required' | 'optional' = 'required') {
  const { user, session, loading } = useAuth();
  
  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}
