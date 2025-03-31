
import React from 'react';

interface GuideArrowProps {
  direction: 'top' | 'right' | 'bottom' | 'left';
  position: {
    top: number;
    left: number;
  };
}

export function GuideArrow({ direction, position }: GuideArrowProps) {
  return (
    <div 
      className={`guide-arrow guide-arrow-${direction}`}
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px` 
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#3b82f6" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </div>
  );
}
