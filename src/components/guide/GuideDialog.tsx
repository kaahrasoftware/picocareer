
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X, Info, Lightbulb } from 'lucide-react';
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
  const connectorRef = useRef<HTMLDivElement>(null);

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
    if (!dialogContentRef.current || !connectorRef.current) return;
    
    // Get element position
    const rect = element.getBoundingClientRect();
    const dialogElement = dialogContentRef.current;
    const connector = connectorRef.current;
    
    // Default to 'bottom' position if not specified
    const position = step.position || 'bottom';
    
    // Reset any previous positioning
    dialogElement.style.position = 'fixed';
    dialogElement.style.top = '';
    dialogElement.style.left = '';
    dialogElement.style.right = '';
    dialogElement.style.bottom = '';
    dialogElement.style.transform = '';
    
    // Hide connector by default
    connector.style.display = 'none';
    
    // Position connector based on dialog position
    connector.style.position = 'absolute';
    connector.style.width = '12px';
    connector.style.height = '12px';
    connector.style.transform = 'rotate(45deg)';
    connector.style.backgroundColor = 'white';
    connector.style.border = '1px solid rgba(229, 231, 235, 1)';
    
    // Position dialog and connector
    switch (position) {
      case 'top':
        dialogElement.style.bottom = `${window.innerHeight - rect.top + 20}px`;
        dialogElement.style.left = `${rect.left + rect.width / 2}px`;
        dialogElement.style.transform = 'translateX(-50%)';
        
        // Show and position connector
        connector.style.display = 'block';
        connector.style.bottom = '-6px';
        connector.style.left = '50%';
        connector.style.transform = 'translateX(-50%) rotate(45deg)';
        connector.style.borderTop = 'none';
        connector.style.borderLeft = 'none';
        break;
        
      case 'right':
        dialogElement.style.left = `${rect.right + 20}px`;
        dialogElement.style.top = `${rect.top + rect.height / 2}px`;
        dialogElement.style.transform = 'translateY(-50%)';
        
        // Show and position connector
        connector.style.display = 'block';
        connector.style.left = '-6px';
        connector.style.top = '50%';
        connector.style.transform = 'translateY(-50%) rotate(45deg)';
        connector.style.borderRight = 'none';
        connector.style.borderBottom = 'none';
        break;
        
      case 'bottom':
        dialogElement.style.top = `${rect.bottom + 20}px`;
        dialogElement.style.left = `${rect.left + rect.width / 2}px`;
        dialogElement.style.transform = 'translateX(-50%)';
        
        // Show and position connector
        connector.style.display = 'block';
        connector.style.top = '-6px';
        connector.style.left = '50%';
        connector.style.transform = 'translateX(-50%) rotate(45deg)';
        connector.style.borderBottom = 'none';
        connector.style.borderRight = 'none';
        break;
        
      case 'left':
        dialogElement.style.right = `${window.innerWidth - rect.left + 20}px`;
        dialogElement.style.top = `${rect.top + rect.height / 2}px`;
        dialogElement.style.transform = 'translateY(-50%)';
        
        // Show and position connector
        connector.style.display = 'block';
        connector.style.right = '-6px';
        connector.style.top = '50%';
        connector.style.transform = 'translateY(-50%) rotate(45deg)';
        connector.style.borderLeft = 'none';
        connector.style.borderTop = 'none';
        break;
        
      case 'center':
        // Center in the viewport
        dialogElement.style.top = '50%';
        dialogElement.style.left = '50%';
        dialogElement.style.transform = 'translate(-50%, -50%)';
        
        // Hide connector for center positioning
        connector.style.display = 'none';
        break;
    }
    
    // Make sure the dialog stays within viewport bounds
    const dialogRect = dialogElement.getBoundingClientRect();
    
    // Handle horizontal overflow
    if (dialogRect.right > window.innerWidth - 20) {
      dialogElement.style.left = '';
      dialogElement.style.right = '20px';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateX(-50%)', '');
      
      // Reposition connector
      if (position === 'top' || position === 'bottom') {
        connector.style.left = 'auto';
        connector.style.right = `${(window.innerWidth - rect.right - 20) / 2}px`;
      }
    } else if (dialogRect.left < 20) {
      dialogElement.style.left = '20px';
      dialogElement.style.right = '';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateX(-50%)', '');
      
      // Reposition connector
      if (position === 'top' || position === 'bottom') {
        connector.style.left = `${rect.left + rect.width / 2 - 20}px`;
        connector.style.transform = 'rotate(45deg)';
      }
    }
    
    // Handle vertical overflow
    if (dialogRect.bottom > window.innerHeight - 20) {
      dialogElement.style.top = '';
      dialogElement.style.bottom = '20px';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateY(-50%)', '');
      
      // Reposition connector
      if (position === 'left' || position === 'right') {
        connector.style.top = 'auto';
        connector.style.bottom = `${(window.innerHeight - rect.bottom - 20) / 2}px`;
      }
    } else if (dialogRect.top < 20) {
      dialogElement.style.top = '20px';
      dialogElement.style.bottom = '';
      dialogElement.style.transform = dialogElement.style.transform.replace('translateY(-50%)', '');
      
      // Reposition connector
      if (position === 'left' || position === 'right') {
        connector.style.top = `${rect.top + rect.height / 2 - 20}px`;
        connector.style.transform = 'rotate(45deg)';
      }
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
        className="guide-dialog bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg fixed z-50 overflow-hidden"
        style={{ 
          position: 'fixed',
          width: '320px',
          maxWidth: '95vw',
          pointerEvents: 'auto'
        }}
      >
        {/* Connector element */}
        <div ref={connectorRef} className="guide-connector"></div>
        
        {/* Dialog header */}
        <div className="p-4 pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="h-6 w-6 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70 flex items-center justify-center"
              aria-label="Close guide"
            >
              <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Dialog content */}
        <div className="p-4">
          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{step.description}</p>
          
          {/* Image/screenshot */}
          {step.image && (
            <div className="mb-4 border rounded-lg overflow-hidden shadow-sm">
              <img 
                src={step.image} 
                alt={`Guide for ${step.title}`} 
                className="w-full object-cover"
              />
            </div>
          )}
          
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-3">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <span 
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  currentStep === index + 1 
                    ? 'bg-blue-500 w-6' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        {/* Dialog footer */}
        <div className="p-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onPrev}
            disabled={currentStep === 1}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Skip
          </Button>
          
          <Button 
            size="sm"
            onClick={onNext}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {currentStep === totalSteps ? 'Finish' : 'Next'}
            {currentStep !== totalSteps && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
