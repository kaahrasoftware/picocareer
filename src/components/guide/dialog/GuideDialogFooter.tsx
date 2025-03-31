
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GuideDialogFooterProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
}

export function GuideDialogFooter({ 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev 
}: GuideDialogFooterProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="text-xs text-muted-foreground">
        {currentStep} of {totalSteps}
      </div>
      
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPrev}
            className="h-8 px-3"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
        )}
        
        <Button 
          size="sm" 
          onClick={onNext}
          className="h-8 px-3"
        >
          {currentStep === totalSteps ? 'Finish' : 'Next'}
          {currentStep !== totalSteps && <ChevronRight className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
