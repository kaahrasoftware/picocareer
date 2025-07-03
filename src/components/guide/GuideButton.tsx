
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useGuide } from '@/context/GuideContext';
import { useLocation } from 'react-router-dom';
import { profileGuide } from '@/data/guides/profileGuide';
import { mentorGuide } from '@/data/guides/mentorGuide';
import { careerGuide } from '@/data/guides/careerGuide';
import { programGuide } from '@/data/guides/programGuide';

interface GuideButtonProps {
  className?: string;
  floating?: boolean;
}

export function GuideButton({ className, floating = false }: GuideButtonProps) {
  const { startGuide, hasSeenGuide } = useGuide();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Get the appropriate guide for the current path
  const getGuideForPath = () => {
    if (currentPath.startsWith('/profile')) return profileGuide;
    if (currentPath.startsWith('/mentor')) return mentorGuide;
    if (currentPath.startsWith('/career')) return careerGuide;
    if (currentPath.startsWith('/program')) return programGuide;
    return null;
  };
  
  const handleStartGuide = () => {
    const guide = getGuideForPath();
    if (guide) {
      startGuide(guide);
    }
  };
  
  const guide = getGuideForPath();
  if (!guide) return null;
  
  // Check if the user has seen this guide before
  const hasSeen = hasSeenGuide(guide.id);
  
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
