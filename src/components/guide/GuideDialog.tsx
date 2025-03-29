
import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuideStep } from '@/context/GuideContext';

interface GuideDialogProps {
  step: GuideStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function GuideDialog({ 
  step, 
  currentStep, 
  totalSteps, 
  onNext, 
  onPrev, 
  onClose 
}: GuideDialogProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ top: 0, left: 0, rotation: 0 });
  const [showImage, setShowImage] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Position the dialog based on the highlighted element and position prop
    const positionDialog = () => {
      if (!step.element || step.position === 'center') {
        // Center the dialog on the screen
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 175,
        });
        return;
      }

      const targetElement = document.querySelector(step.element);
      
      if (!targetElement || !dialogRef.current) {
        // Default positioning in case element is not found
        setPosition({
          top: 100,
          left: window.innerWidth / 2 - 175,
        });
        return;
      }

      const targetRect = targetElement.getBoundingClientRect();
      const dialogRect = dialogRef.current.getBoundingClientRect();
      
      // Calculate positions for dialog and connector
      let top = 0;
      let left = 0;
      let arrowTop = 0;
      let arrowLeft = 0;
      let rotation = 0;

      // Highlight the target element
      targetElement.classList.add('guide-highlight');
      
      // Position based on preference, with bounds checking
      switch (step.position) {
        case 'top':
          top = targetRect.top - dialogRect.height - 20;
          left = targetRect.left + (targetRect.width / 2) - (dialogRect.width / 2);
          arrowTop = dialogRect.height;
          arrowLeft = dialogRect.width / 2;
          rotation = 180;
          break;
        case 'bottom':
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width / 2) - (dialogRect.width / 2);
          arrowTop = -10;
          arrowLeft = dialogRect.width / 2;
          rotation = 0;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (dialogRect.height / 2);
          left = targetRect.left - dialogRect.width - 20;
          arrowTop = dialogRect.height / 2;
          arrowLeft = dialogRect.width;
          rotation = 90;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (dialogRect.height / 2);
          left = targetRect.right + 20;
          arrowTop = dialogRect.height / 2;
          arrowLeft = -10;
          rotation = 270;
          break;
        default:
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width / 2) - (dialogRect.width / 2);
          arrowTop = -10;
          arrowLeft = dialogRect.width / 2;
          rotation = 0;
      }
      
      // Ensure dialog stays within viewport
      if (left < 20) left = 20;
      if (left + dialogRect.width > window.innerWidth - 20) {
        left = window.innerWidth - dialogRect.width - 20;
      }
      
      if (top < 20) top = 20;
      if (top + dialogRect.height > window.innerHeight - 20) {
        top = window.innerHeight - dialogRect.height - 20;
      }
      
      setPosition({ top, left });
      setArrowPosition({ top: arrowTop, left: arrowLeft, rotation });
    };

    // Position the dialog and add highlight to element
    positionDialog();
    
    // Add window resize handler
    window.addEventListener('resize', positionDialog);
    
    // Clean up function
    return () => {
      window.removeEventListener('resize', positionDialog);
      
      // Remove highlight from all elements
      document.querySelectorAll('.guide-highlight').forEach((el) => {
        el.classList.remove('guide-highlight');
      });
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        ref={dialogRef}
        className="guide-dialog fixed bg-white rounded-lg shadow-lg p-4 pointer-events-auto border border-gray-200"
        style={{ 
          top: `${position.top}px`, 
          left: `${position.left}px`,
          width: '350px',
          maxWidth: '90vw'
        }}
      >
        {/* Arrow connector (when not centered) */}
        {step.position !== 'center' && (
          <div
            className="guide-connector absolute w-4 h-4 bg-white border-t border-l border-gray-200 transform -rotate-45"
            style={{
              top: `${arrowPosition.top}px`,
              left: `${arrowPosition.left}px`,
              transform: `rotate(${arrowPosition.rotation}deg)`,
            }}
          />
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <p className="text-sm text-muted-foreground">{step.description}</p>
          
          {step.image && (
            <div className="mt-3">
              {showImage ? (
                <div className="relative mt-2">
                  <img 
                    src={step.image} 
                    alt={step.title} 
                    className="rounded border border-gray-200 max-w-full max-h-48 object-contain" 
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/80 rounded-full"
                    onClick={() => setShowImage(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 text-xs"
                  onClick={() => setShowImage(true)}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  View Screenshot
                </Button>
              )}
            </div>
          )}
        </div>
        
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
      </div>
    </div>
  );
}
