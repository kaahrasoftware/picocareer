
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuideContextType {
  isGuideActive: boolean;
  currentStep: number;
  startGuide: (route?: string) => void;
  nextStep: () => void;
  endGuide: () => void;
  hasSeenGuide: (route: string) => boolean;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: ReactNode }) {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [seenGuides, setSeenGuides] = useState<string[]>([]);

  const startGuide = (route?: string) => {
    setIsGuideActive(true);
    setCurrentStep(0);
    if (route && !seenGuides.includes(route)) {
      setSeenGuides(prev => [...prev, route]);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const endGuide = () => {
    setIsGuideActive(false);
    setCurrentStep(0);
  };

  const hasSeenGuide = (route: string) => {
    return seenGuides.includes(route);
  };

  return (
    <GuideContext.Provider value={{
      isGuideActive,
      currentStep,
      startGuide,
      nextStep,
      endGuide,
      hasSeenGuide
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
