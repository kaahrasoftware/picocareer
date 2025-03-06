
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { MessageOption } from '@/types/database/message-types';
import { cn } from '@/lib/utils';
import { CustomInputField } from './CustomInputField';

interface ChipsLayoutProps {
  options: MessageOption[];
  selectedOptions: string[];
  handleSelectOption: (option: MessageOption) => void;
  showCustomInput: boolean;
  customValue: string;
  handleCustomValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomSubmit: () => void;
  handleSubmitMultiple: () => void;
  allowMultiple: boolean;
}

export function ChipsLayout({
  options,
  selectedOptions,
  handleSelectOption,
  showCustomInput,
  customValue,
  handleCustomValueChange,
  handleCustomSubmit,
  handleSubmitMultiple,
  allowMultiple
}: ChipsLayoutProps) {
  // Check if an option is currently selected
  const isOptionSelected = (option: MessageOption): boolean => {
    return selectedOptions.includes(option.text);
  };

  return (
    <div className="flex flex-wrap gap-2 w-full max-w-2xl my-4 animate-fade-in">
      {options.map((option) => {
        const isSelected = isOptionSelected(option);
        
        return (
          <Button
            key={option.id}
            variant="outline"
            size="sm"
            className={cn(
              "rounded-full border transition-all duration-200 bg-white hover:bg-gray-50",
              isSelected 
                ? "border-primary text-primary shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
              "text-xs font-medium h-8 px-3",
              "aria-pressed:scale-105"
            )}
            onClick={() => handleSelectOption(option)}
            aria-pressed={isSelected}
            disabled={!allowMultiple && selectedOptions.length > 0 && !isSelected && option.id !== 'other'}
          >
            {isSelected && <span className="mr-1"><Check className="h-3 w-3" /></span>}
            {option.id === 'other' && <Plus className="h-3 w-3 mr-1" />}
            <span className="text-gray-800">{option.text}</span>
          </Button>
        );
      })}
      
      {showCustomInput && (
        <CustomInputField
          value={customValue}
          onChange={handleCustomValueChange}
          onSubmit={handleCustomSubmit}
          autoFocus={true}
        />
      )}
      
      {allowMultiple && selectedOptions.length > 0 && !showCustomInput && (
        <div className="w-full mt-3">
          <Button 
            onClick={handleSubmitMultiple}
            className="bg-primary hover:bg-primary/90 gap-1.5 rounded-full px-4 py-2 text-xs shadow-sm hover:shadow-md transition-all"
          >
            Continue with {selectedOptions.length} selection{selectedOptions.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
