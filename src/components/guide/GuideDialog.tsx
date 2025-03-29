
import React, { useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { GuideStep } from '@/context/GuideContext';

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
  const targetRef = useRef<HTMLElement | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Find and highlight the target element
  useEffect(() => {
    if (step.element) {
      try {
        const element = document.querySelector(step.element) as HTMLElement;
        if (element) {
          targetRef.current = element;
          
          // Add highlight effect
          element.classList.add('guide-highlight');
          
          // Position the dialog near the element
          positionDialogNearElement(element);
          
          // Scroll the element into view if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (error) {
        console.error('Error finding guide target element:', error);
      }
    }
    
    return () => {
      // Clean up highlight effect
      if (targetRef.current) {
        targetRef.current.classList.remove('guide-highlight');
        targetRef.current = null;
      }
    };
  }, [step.element]);
  
  // Function to position the dialog near the target element
  const positionDialogNearElement = (element: HTMLElement) => {
    if (!dialogContentRef.current) return;
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const dialogElement = dialogContentRef.current;
    
    // Default to 'bottom' position if not specified
    const position = step.position || 'bottom';
    
    // Reset any previous positioning
    dialogElement.style.position = 'fixed';
    dialogElement.style.top = '';
    dialogElement.style.left = '';
    dialogElement.style.right = '';
    dialogElement.style.bottom = '';
    dialogElement.style.transform = '';
    
    switch (position) {
      case 'top':
        dialogElement.style.bottom = `${window.innerHeight - rect.top + 20}px`;
        dialogElement.style.left = `${rect.left + rect.width / 2}px`;
        dialogElement.style.transform = 'translateX(-50%)';
        break;
      case 'right':
        dialogElement.style.left = `${rect.right + 20}px`;
        dialogElement.style.top = `${rect.top + rect.height / 2}px`;
        dialogElement.style.transform = 'translateY(-50%)';
        break;
      case 'bottom':
        dialogElement.style.top = `${rect.bottom + 20}px`;
        dialogElement.style.left = `${rect.left + rect.width / 2}px`;
        dialogElement.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        dialogElement.style.right = `${window.innerWidth - rect.left + 20}px`;
        dialogElement.style.top = `${rect.top + rect.height / 2}px`;
        dialogElement.style.transform = 'translateY(-50%)';
        break;
      case 'center':
        // Center in the viewport
        dialogElement.style.top = '50%';
        dialogElement.style.left = '50%';
        dialogElement.style.transform = 'translate(-50%, -50%)';
        break;
    }
    
    // Make sure the dialog stays within viewport bounds
    const dialogRect = dialogElement.getBoundingClientRect();
    
    // Handle horizontal overflow
    if (dialogRect.right > window.innerWidth - 20) {
      dialogElement.style.left = '';
      dialogElement.style.right = '20px';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateX(-50%)', '');
    } else if (dialogRect.left < 20) {
      dialogElement.style.left = '20px';
      dialogElement.style.right = '';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateX(-50%)', '');
    }
    
    // Handle vertical overflow
    if (dialogRect.bottom > window.innerHeight - 20) {
      dialogElement.style.top = '';
      dialogElement.style.bottom = '20px';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateY(-50%)', '');
    } else if (dialogRect.top < 20) {
      dialogElement.style.top = '20px';
      dialogElement.style.bottom = '';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateY(-50%)', '');
    }
  };

  // Create a custom dialog that doesn't use the standard Dialog components to avoid the backdrop
  return (
    <div 
      className="fixed z-50"
      style={{ 
        pointerEvents: 'none',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div
        ref={dialogContentRef}
        className="guide-dialog bg-white dark:bg-gray-900 rounded-lg border shadow-lg fixed z-50"
        style={{ 
          position: 'fixed',
          width: '320px',
          maxWidth: '95vw',
          pointerEvents: 'auto',
          zIndex: 50
        }}
      >
        <div className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <button 
              onClick={onClose}
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="px-4 py-2">
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
          
          {step.image && (
            <div className="mb-4 border rounded overflow-hidden">
              <img 
                src={step.image} 
                alt={`Guide for ${step.title}`} 
                className="w-full object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <span 
                key={index}
                className={`h-2 w-2 rounded-full ${currentStep === index + 1 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        <div className="p-4 flex justify-between items-center border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onPrev}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </Button>
          
          <Button 
            size="sm"
            onClick={onNext}
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            {currentStep !== totalSteps && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
