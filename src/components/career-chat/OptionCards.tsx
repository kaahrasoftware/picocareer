
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface OptionCardsProps {
  options: string[];
  onSelect: (option: string) => void;
}

export function OptionCards({ options, onSelect }: OptionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-4 animate-fade-in">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-3 px-4 text-left flex flex-col items-start gap-1 bg-gradient-to-r from-white to-blue-50/40 hover:to-blue-50 hover:bg-primary/5 border border-blue-100 rounded-lg transition-all shadow-sm hover:shadow group"
          onClick={() => onSelect(option)}
        >
          <div className="flex w-full justify-between items-center">
            <span className="font-medium text-gray-800">{option}</span>
            <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Button>
      ))}
    </div>
  );
}
