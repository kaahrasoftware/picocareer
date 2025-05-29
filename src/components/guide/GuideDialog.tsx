
import React, { useEffect, useState, useRef } from 'react';
import { GuideStep } from '../guide/types';
import { GuideDialogHeader } from './dialog/GuideDialogHeader';
import { GuideDialogFooter } from './dialog/GuideDialogFooter';
import { GuideArrow } from './dialog/GuideArrow';
import { isElementInViewport, calculateDialogPosition } from './utils/positionUtils';

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
  const [guideArrowPosition, setGuideArrowPosition] = useState({ top: 0, left: 0, direction: 'right' as const });
  const dialogRef = useRef<HTMLDivElement>(null);
  const highlightedElementRef = useRef<Element | null>(null);
  
  useEffect(() => {
    // Clean up previous highlights and arrows
    const cleanupElements = () => {
      document.querySelectorAll('.guide-highlight').forEach((el) => {
        el.classList.remove('guide-highlight', 'guide-highlight-bright');
      });
      
      document.querySelectorAll('.guide-arrow').forEach((el) => {
        el.remove();
      });
    };

    cleanupElements();
    
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
      highlightedElementRef.current = targetElement;
      
      if (!targetElement || !dialogRef.current) {
        // Default positioning in case element is not found
        setPosition({
          top: 100,
          left: window.innerWidth / 2 - 175,
        });
        return;
      }

      // Highlight the target element with appropriate color
      targetElement.classList.add('guide-highlight');
      if (step.highlightColor === 'bright') {
        targetElement.classList.add('guide-highlight-bright');
      }
      
      // Scroll the element into view if needed
      if (!isElementInViewport(targetElement)) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Calculate positions
      const { dialogPosition, arrowPosition: connectorPosition, guideArrowPosition: directionalArrowPosition } = 
        calculateDialogPosition(targetElement, dialogRef.current, step.position || 'bottom');
      
      setPosition(dialogPosition);
      setArrowPosition(connectorPosition);
      setGuideArrowPosition(directionalArrowPosition);
      
      // Create the directional arrow
      const arrow = document.createElement('div');
      arrow.className = `guide-arrow guide-arrow-${directionalArrowPosition.direction}`;
      arrow.style.top = `${directionalArrowPosition.top}px`;
      arrow.style.left = `${directionalArrowPosition.left}px`;
      arrow.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
      document.body.appendChild(arrow);
    };

    // Position the dialog and add highlight to element
    positionDialog();
    
    // Add window resize handler
    window.addEventListener('resize', positionDialog);
    
    // Clean up function
    return () => {
      window.removeEventListener('resize', positionDialog);
      cleanupElements();
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
        
        <GuideDialogHeader 
          title={step.title} 
          description={step.description} 
          onClose={onClose} 
        />
        
        <GuideDialogFooter 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          onNext={onNext}
          onPrev={onPrev}
        />
      </div>
    </div>
  );
}
