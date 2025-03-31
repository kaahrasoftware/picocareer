
export type GuideStep = {
  id: string;
  title: string;
  description: string;
  element?: string; // CSS selector for the element to highlight
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  requiredAuth?: boolean; // If true, user needs to be logged in to see this step
  highlightColor?: 'blue' | 'bright'; // Option to choose highlight color
  demoAction?: {
    type: 'open-dialog' | 'navigate' | 'scroll-to';
    target: string; // Dialog ID, route path, or element selector
    data?: any; // Additional data for the action
  };
};

export type GuidePage = {
  path: string;
  steps: GuideStep[];
};

export type GuideContextType = {
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
