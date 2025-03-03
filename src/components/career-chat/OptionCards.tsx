
import React from 'react';
import { Button } from '@/components/ui/button';

interface OptionCardsProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function OptionCards({ options, onSelect }: OptionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-4">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-3 px-4 text-left flex flex-col items-start gap-1 bg-white hover:bg-primary/5 border border-blue-100 rounded-lg transition-all shadow-sm hover:shadow"
          onClick={() => onSelect(option)}
        >
          <span className="font-medium text-gray-800">{option}</span>
        </Button>
      ))}
    </div>
  );
}
