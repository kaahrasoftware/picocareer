
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomInputFieldProps {
  customValue: string;
  handleCustomValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomSubmit: () => void;
  isSelecting: boolean;
  disabled?: boolean;
}

export function CustomInputField({ 
  customValue, 
  handleCustomValueChange, 
  handleCustomSubmit,
  isSelecting,
  disabled = false
}: CustomInputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customValue.trim() && !isSelecting && !disabled) {
      e.preventDefault(); // Prevent form submission
      handleCustomSubmit();
    }
  };

  return (
    <div className={cn(
      "flex gap-2 mt-4",
      disabled && "opacity-70"
    )}>
      <input
        ref={inputRef}
        type="text"
        className={cn(
          "flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all",
          isSelecting && "bg-gray-50",
          disabled && "bg-gray-100 cursor-not-allowed"
        )}
        value={customValue}
        onChange={handleCustomValueChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your custom answer..."
        disabled={isSelecting || disabled}
      />
      <Button 
        type="button"
        onClick={handleCustomSubmit} 
        disabled={!customValue.trim() || isSelecting || disabled}
        className="shadow-sm hover:shadow-md transition-all"
      >
        {isSelecting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Submit
      </Button>
    </div>
  );
}
