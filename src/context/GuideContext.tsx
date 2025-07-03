
import React, { createContext, useContext, useState } from 'react';

export interface Guide {
  id: string;
  title: string;
  description: string;
  steps: GuideStep[];
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface GuideContextType {
  currentGuide: Guide | null;
  currentStep: number;
  isActive: boolean;
  startGuide: (guide: Guide) => void;
  nextStep: () => void;
  prevStep: () => void;
  endGuide: () => void;
  setCurrentStep: (step: number) => void;
  hasSeenGuide: (guideId: string) => boolean;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [seenGuides, setSeenGuides] = useState<Set<string>>(new Set());

  const startGuide = (guide: Guide) => {
    setCurrentGuide(guide);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentGuide && currentStep < currentGuide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const endGuide = () => {
    if (currentGuide) {
      setSeenGuides(prev => new Set(prev).add(currentGuide.id));
    }
    setCurrentGuide(null);
    setCurrentStep(0);
    setIsActive(false);
  };

  const hasSeenGuide = (guideId: string) => {
    return seenGuides.has(guideId);
  };

  return (
    <GuideContext.Provider
      value={{
        currentGuide,
        currentStep,
        isActive,
        startGuide,
        nextStep,
        prevStep,
        endGuide,
        setCurrentStep,
        hasSeenGuide,
      }}
    >
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
