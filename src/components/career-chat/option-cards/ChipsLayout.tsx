
import React from 'react';
import { Button } from '@/components/ui/button';
import { OptionCardsLayoutProps } from './types';
import { Loader2 } from 'lucide-react';
import { CustomInputField } from './CustomInputField';
import { cn } from '@/lib/utils';

export function ChipsLayout({
  options,
  selectedOptions,
  handleSelectOption,
  showCustomInput,
  customValue,
  handleCustomValueChange,
  handleCustomSubmit,
  handleSubmitMultiple,
  allowMultiple,
  isSelecting,
  disabled
}: OptionCardsLayoutProps) {
  return (
    <div className={cn(
      "space-y-4 my-4 w-full",
      disabled && "opacity-70 pointer-events-none"
    )}>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.text);
          const isProcessing = isSelecting && isSelected;
          
          return (
            <Button
              key={option.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "rounded-full transition-all duration-200",
                isSelected ? "bg-primary text-primary-foreground" : "",
                isProcessing ? "opacity-70 cursor-not-allowed" : "",
                disabled ? "opacity-50 cursor-not-allowed" : ""
              )}
              onClick={() => handleSelectOption(option)}
              disabled={isSelecting || disabled}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {option.text}
            </Button>
          );
        })}
      </div>

      {showCustomInput && (
        <CustomInputField
          customValue={customValue}
          handleCustomValueChange={handleCustomValueChange}
          handleCustomSubmit={handleCustomSubmit}
          isSelecting={isSelecting}
          disabled={disabled}
        />
      )}

      {allowMultiple && selectedOptions.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSubmitMultiple}
            disabled={isSelecting || disabled}
            className="shadow-sm hover:shadow-md transition-all"
          >
            {isSelecting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
