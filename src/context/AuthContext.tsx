
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';

interface AuthContextType {
  session: any;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: false,
  isError: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { session, isLoading, isError } = useAuthSession();

  return (
    <AuthContext.Provider value={{ session, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
};
