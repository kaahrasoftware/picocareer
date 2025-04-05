
import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string | null;
  setLoadingMessage: (message: string | null) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, loadingMessage, setLoadingMessage }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
