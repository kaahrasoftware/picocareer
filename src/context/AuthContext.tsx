
import React, { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionTimeoutDialog } from '@/components/auth/SessionTimeoutDialog';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use the extracted auth state hook
  const { session, user, loading, error, signOut } = useAuthState();
  
  // Use the extracted session timeout hook
  const { 
    showTimeoutWarning, 
    handleContinueSession, 
    handleLogout 
  } = useSessionTimeout(session, signOut);

  const value = {
    session,
    user,
    loading,
    error,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      <SessionTimeoutDialog
        isOpen={showTimeoutWarning}
        onContinue={handleContinueSession}
        onLogout={handleLogout}
        timeoutMinutes={30} // Updated to match new timeout
      />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
