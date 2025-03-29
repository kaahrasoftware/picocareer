
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GuideDialog } from '@/components/guide/GuideDialog';
import { useAuthSession } from '@/hooks/useAuthSession';

// Guide types
export type GuideStep = {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  requiredAuth?: boolean; // If true, user needs to be logged in to see this step
  highlightColor?: 'gold' | 'green'; // Option to choose highlight color
};

export type GuidePage = {
  path: string;
  steps: GuideStep[];
};

type GuideContextType = {
  isGuideActive: boolean;
  startGuide: (path?: string) => void;
  stopGuide: () => void;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipToStep: (stepIndex: number) => void;
  hasSeenGuide: (path: string) => boolean;
  markGuideAsSeen: (path: string) => void;
};

const GuideContext = createContext<GuideContextType | undefined>(undefined);

// Create a component to wrap RouterProvider and provide Guide context
export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentGuide, setCurrentGuide] = useState<GuideStep[]>([]);
  const [seenGuides, setSeenGuides] = useLocalStorage<string[]>('picocareer-seen-guides', []);
  
  // Get auth state safely without requiring router context
  const { isAuthenticated } = useAuthSession('optional');

  // Import the guides data based on the path
  const getGuideForPath = async (path: string): Promise<GuideStep[]> => {
    try {
      // Dynamic import based on the path
      let guideModule;
      
      switch (path) {
        case '/':
          guideModule = await import('@/data/guides/homeGuide');
          break;
        case '/mentor':
          guideModule = await import('@/data/guides/mentorGuide');
          break;
        case '/career':
          guideModule = await import('@/data/guides/careerGuide');
          break;
        case '/program':
          guideModule = await import('@/data/guides/programGuide');
          break;
        case '/profile':
          guideModule = await import('@/data/guides/profileGuide');
          break;
        default:
          guideModule = await import('@/data/guides/homeGuide');
      }
      
      return guideModule.default;
    } catch (error) {
      console.error('Error loading guide data:', error);
      return [];
    }
  };

  const startGuide = async (path?: string) => {
    const targetPath = path || window.location.pathname;
    const guide = await getGuideForPath(targetPath);
    
    // Filter out steps that require auth if user is not authenticated
    const filteredGuide = isAuthenticated 
      ? guide 
      : guide.filter(step => !step.requiredAuth);
    
    if (filteredGuide.length === 0) return;
    
    // We'll let the router handle navigation via links instead of programmatic navigation
    setCurrentGuide(filteredGuide);
    setCurrentPage(targetPath);
    setCurrentStep(0);
    setIsGuideActive(true);
  };

  const stopGuide = () => {
    setIsGuideActive(false);
    setCurrentStep(0);
    setCurrentGuide([]);
    setCurrentPage(null);
  };

  const nextStep = () => {
    if (currentStep < currentGuide.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // If we're at the last step, mark the guide as seen and close it
      if (currentPage) {
        markGuideAsSeen(currentPage);
      }
      stopGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < currentGuide.length) {
      setCurrentStep(stepIndex);
    }
  };

  const hasSeenGuide = (path: string): boolean => {
    return seenGuides.includes(path);
  };

  const markGuideAsSeen = (path: string) => {
    if (!seenGuides.includes(path)) {
      setSeenGuides(prev => [...prev, path]);
    }
  };

  const value = {
    isGuideActive,
    startGuide,
    stopGuide,
    currentStep,
    totalSteps: currentGuide.length,
    nextStep,
    prevStep,
    skipToStep,
    hasSeenGuide,
    markGuideAsSeen,
  };

  return (
    <GuideContext.Provider value={value}>
      {children}
      {isGuideActive && currentGuide.length > 0 && (
        <GuideDialog
          step={currentGuide[currentStep]}
          currentStep={currentStep + 1}
          totalSteps={currentGuide.length}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={stopGuide}
        />
      )}
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
