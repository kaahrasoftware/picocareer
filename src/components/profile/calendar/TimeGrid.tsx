import React from 'react';

interface TimeGridProps {
  timezone: string;
  cellHeight: number;
}

export function TimeGrid({ timezone, cellHeight }: TimeGridProps) {
  // Generate 48 slots for the 24-hour day (30-minute intervals)
  const slots = Array.from({ length: 48 }, (_, i) => i);

  return (
    <div className="relative" style={{ paddingTop: '3px' }}>
      {slots.map((index) => (
        <div
          key={index}
          className="border-b border-border/10"
          style={{ 
            height: `${cellHeight}px`,
          }}
        />
      ))}
    </div>
  );
}