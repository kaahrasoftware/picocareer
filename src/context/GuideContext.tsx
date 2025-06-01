
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuideContextType {
  isGuideActive: boolean;
  currentStep: number;
  startGuide: (route?: string) => void;
  nextStep: () => void;
  endGuide: () => void;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startGuide = (route?: string) => {
    setIsGuideActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const endGuide = () => {
    setIsGuideActive(false);
    setCurrentStep(0);
  };

  return (
    <GuideContext.Provider value={{
      isGuideActive,
      currentStep,
      startGuide,
      nextStep,
      endGuide
    }}>
      {children}
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GuideProvider');
  }
  return context;
}
