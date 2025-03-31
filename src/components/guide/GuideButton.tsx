
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useGuide } from '@/context/GuideContext';
import { useLocation } from 'react-router-dom';

interface GuideButtonProps {
  className?: string;
  floating?: boolean;
}

export function GuideButton({ className, floating = false }: GuideButtonProps) {
  const { startGuide, hasSeenGuide } = useGuide();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Simplify the path for guide matching
  const getSimplifiedPath = () => {
    // For the home page
    if (currentPath === '/') return '/';
    
    // Remove any parameters or sub-paths and get the main section
    const mainPath = '/' + currentPath.split('/')[1];
    return mainPath;
  };
  
  const handleStartGuide = () => {
    startGuide(getSimplifiedPath());
  };
  
  // Determine if there's a guide available for this page
  const isGuideAvailable = () => {
    const validPaths = ['/', '/mentor', '/career', '/program', '/profile'];
    return validPaths.includes(getSimplifiedPath());
  };
  
  if (!isGuideAvailable()) return null;
  
  // Check if the user has seen this guide before
  const hasSeen = hasSeenGuide(getSimplifiedPath());
  
  if (floating) {
    return (
      <button
        className={`guide-floating-button ${!hasSeen ? 'guide-button-new' : ''}`}
        onClick={handleStartGuide}
        title="View page guide"
      >
        <HelpCircle className="h-6 w-6 text-blue-500" />
        <span className="sr-only">Help & Guide</span>
      </button>
    );
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative ${className} ${!hasSeen ? 'guide-button-new' : ''}`}
      onClick={handleStartGuide}
      title="View page guide"
    >
      <HelpCircle className="h-5 w-5 text-blue-500" />
      <span className="sr-only">Help & Guide</span>
    </Button>
  );
}
