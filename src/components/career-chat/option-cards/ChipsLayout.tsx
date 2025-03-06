
import React from 'react';
import { Button } from '@/components/ui/button';
import { OptionCardsLayoutProps } from './types';
import { Loader2 } from 'lucide-react';
import { CustomInputField } from './CustomInputField';

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
  isSelecting
}: OptionCardsLayoutProps) {
  return (
    <div className="space-y-4 my-4 w-full">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            variant={selectedOptions.includes(option.text) ? "default" : "outline"}
            className={`rounded-full ${
              selectedOptions.includes(option.text) ? "bg-primary text-primary-foreground" : ""
            } ${isSelecting ? "opacity-70 cursor-not-allowed" : ""}`}
            onClick={() => handleSelectOption(option)}
            disabled={isSelecting}
          >
            {isSelecting && selectedOptions.includes(option.text) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {option.text}
          </Button>
        ))}
      </div>

      {showCustomInput && (
        <CustomInputField
          customValue={customValue}
          handleCustomValueChange={handleCustomValueChange}
          handleCustomSubmit={handleCustomSubmit}
          isSelecting={isSelecting}
        />
      )}

      {allowMultiple && selectedOptions.length > 0 && (
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSubmitMultiple}
            disabled={isSelecting}
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
