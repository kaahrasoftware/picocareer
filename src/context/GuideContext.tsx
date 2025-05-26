
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuideContextType {
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const useGuide = () => {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
};

interface GuideProviderProps {
  children: ReactNode;
}

export const GuideProvider: React.FC<GuideProviderProps> = ({ children }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const value = {
    isGuideOpen,
    setIsGuideOpen,
    currentStep,
    setCurrentStep,
  };

  return (
    <GuideContext.Provider value={value}>
      {children}
    </GuideContext.Provider>
  );
};
