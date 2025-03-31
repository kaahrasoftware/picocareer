
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GuideDialog } from '@/components/guide/GuideDialog';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useNavigate } from 'react-router-dom';
import { GuideStep, GuideContextType } from '@/components/guide/types';
import { getGuideForPath } from '@/components/guide/utils/guideLoader';
import { executeDemoAction } from '@/components/guide/utils/demoActions';

const GuideContext = createContext<GuideContextType | undefined>(undefined);

// Create a component to wrap RouterProvider and provide Guide context
export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentGuide, setCurrentGuide] = useState<GuideStep[]>([]);
  const [seenGuides, setSeenGuides] = useLocalStorage<string[]>('picocareer-seen-guides', []);
  const navigate = useNavigate();
  
  // Get auth state safely without requiring router context
  const { isAuthenticated } = useAuthSession('optional');

  // Execute demo actions for the current step
  useEffect(() => {
    if (!isGuideActive || currentGuide.length === 0 || currentStep >= currentGuide.length) return;
    
    const currentStepData = currentGuide[currentStep];
    executeDemoAction(currentStepData, navigate);
  }, [isGuideActive, currentStep, currentGuide, navigate]);

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
    
    // Remove any highlight classes
    document.querySelectorAll('.guide-highlight').forEach((el) => {
      el.classList.remove('guide-highlight', 'guide-highlight-green');
    });
    
    // Remove any guide arrows
    document.querySelectorAll('.guide-arrow').forEach((el) => {
      el.remove();
    });
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

// Re-export types from the types file
export type { GuideStep, GuidePage } from '@/components/guide/types';
