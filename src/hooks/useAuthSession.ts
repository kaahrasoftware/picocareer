
import { useAuth } from '@/context/AuthContext';

export const useAuthSession = () => {
  const { session, user, isLoading } = useAuth();
  
  return {
    session,
    user,
    isLoading,
  };
};
