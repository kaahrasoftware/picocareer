import React from 'react';

interface TimeGridLinesProps {
  cellHeight: number;
}

export function TimeGridLines({ cellHeight }: TimeGridLinesProps) {
  return (
    <>
      {Array.from({ length: 48 }, (_, index) => (
        <div
          key={index}
          className="absolute w-full border-t border-border/30"
          style={{ top: `${index * cellHeight}px` }}
        />
      ))}
    </>
  );
}