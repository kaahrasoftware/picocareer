
import React, { createContext, useContext, useState } from 'react';

type LoadingContextType = {
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  isDataLoading: boolean;
  setDataLoading: (loading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoading, setPageLoading] = useState(false);
  const [isDataLoading, setDataLoading] = useState(false);

  return (
    <LoadingContext.Provider
      value={{
        isPageLoading,
        setPageLoading,
        isDataLoading,
        setDataLoading
      }}
    >
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
