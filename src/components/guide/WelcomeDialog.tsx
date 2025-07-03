
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGuide } from '@/context/GuideContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function WelcomeDialog() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('picocareer-welcome-seen', false);
  const { startGuide } = useGuide();

  useEffect(() => {
    // Only show the welcome dialog if user hasn't seen it before
    if (!hasSeenWelcome) {
      // Slight delay to ensure everything is loaded
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome]);

  const handleClose = () => {
    setShowWelcome(false);
    setHasSeenWelcome(true);
  };

  const handleStartGuide = () => {
    handleClose();
    startGuide('/');
  };

  return (
    <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to PicoCareer!</DialogTitle>
          <DialogDescription>
            Your journey to finding the perfect educational and career path starts here.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            PicoCareer helps you explore career paths, find mentors, and discover academic programs tailored to your interests and goals.
          </p>
          
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Would you like a quick tour?</h4>
            <p className="text-xs text-muted-foreground">
              Our interactive guide will help you understand how to make the most of PicoCareer's features.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button onClick={handleStartGuide}>
            Start the Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
