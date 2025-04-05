
import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoadingState = {
  isLoading: boolean;
  progress: number;
  message: string;
};

type LoadingContextType = {
  globalLoading: LoadingState;
  setGlobalLoading: (state: Partial<LoadingState>) => void;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  updateProgress: (progress: number, message?: string) => void;
};

const LoadingContext = createContext<LoadingContextType>({
  globalLoading: { isLoading: false, progress: 0, message: '' },
  setGlobalLoading: () => {},
  startLoading: () => {},
  stopLoading: () => {},
  updateProgress: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalLoading, setGlobalLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: '',
  });

  const setGlobalLoading = (state: Partial<LoadingState>) => {
    setGlobalLoadingState(prev => ({ ...prev, ...state }));
  };

  const startLoading = (message = 'Loading...') => {
    setGlobalLoadingState({ isLoading: true, progress: 0, message });
  };

  const stopLoading = () => {
    setGlobalLoadingState({ isLoading: false, progress: 0, message: '' });
  };

  const updateProgress = (progress: number, message?: string) => {
    setGlobalLoadingState(prev => ({
      ...prev,
      progress,
      message: message || prev.message,
    }));
  };

  return (
    <LoadingContext.Provider
      value={{
        globalLoading,
        setGlobalLoading,
        startLoading,
        stopLoading,
        updateProgress,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
