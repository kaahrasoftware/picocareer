
import React from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { MessageOption } from '@/types/database/message-types';
import { cn } from '@/lib/utils';
import { CustomInputField } from './CustomInputField';

interface CardsLayoutProps {
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

export function CardsLayout({
  options,
  selectedOptions,
  handleSelectOption,
  showCustomInput,
  customValue,
  handleCustomValueChange,
  handleCustomSubmit,
  handleSubmitMultiple,
  allowMultiple
}: CardsLayoutProps) {
  // Check if an option is currently selected
  const isOptionSelected = (option: MessageOption): boolean => {
    return selectedOptions.includes(option.text);
  };

  // Determine grid columns based on number of options
  const gridCols = options.length <= 2 ? 
    "grid-cols-1 sm:grid-cols-2" : 
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className="w-full space-y-4 animate-fade-in">
      <div className={`grid ${gridCols} gap-3 w-full max-w-3xl`}>
        {options.map((option) => {
          const isSelected = isOptionSelected(option);
          
          return (
            <button
              key={option.id}
              className={cn(
                "py-3 px-4 text-left rounded-lg",
                "transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "bg-white hover:bg-gray-50",
                isSelected 
                  ? "border-2 border-primary shadow-sm" 
                  : "border border-gray-200 hover:border-gray-300 hover:shadow",
                "group aria-pressed:shadow"
              )}
              onClick={() => handleSelectOption(option)}
              aria-pressed={isSelected}
              role="checkbox"
              aria-checked={isSelected}
              disabled={!allowMultiple && selectedOptions.length > 0 && !isSelected && option.id !== 'other'}
            >
              <div className="flex w-full justify-between items-center">
                <span className="font-medium text-xs text-gray-800">
                  {option.id === 'other' && <Plus className="h-3 w-3 inline mr-1" />}
                  {option.text}
                </span>
                {isSelected ? (
                  <div className="flex items-center justify-center rounded-full h-5 w-5 bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                  </div>
                ) : (
                  <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                )}
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {showCustomInput && (
        <CustomInputField
          value={customValue}
          onChange={handleCustomValueChange}
          onSubmit={handleCustomSubmit}
          autoFocus={true}
        />
      )}

      {allowMultiple && selectedOptions.length > 0 && !showCustomInput && (
        <div className="flex justify-center mt-3">
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
