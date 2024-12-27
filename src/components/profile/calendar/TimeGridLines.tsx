import React from 'react';

interface TimeGridLinesProps {
  cellHeight: number;
}

export function TimeGridLines({ cellHeight }: TimeGridLinesProps) {
  return (
    <div className="absolute inset-0">
      {Array.from({ length: 48 }, (_, index) => (
        <div
          key={index}
          className="absolute w-full border-t border-border/50"
          style={{ 
            top: `${index * cellHeight}px`,
            height: `${cellHeight}px`
          }}
        />
      ))}
    </div>
  );
}