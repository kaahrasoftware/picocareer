
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useGuide } from '@/context/GuideContext';
import { useLocation } from 'react-router-dom';

interface GuideButtonProps {
  className?: string;
}

export function GuideButton({ className }: GuideButtonProps) {
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
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`relative ${className}`}
      onClick={handleStartGuide}
    >
      <HelpCircle className="h-5 w-5" />
      <span className="sr-only">Help & Guide</span>
      
      {/* Show a dot indicator if the user hasn't seen this guide yet */}
      {!hasSeen && (
        <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary" />
      )}
    </Button>
  );
}
