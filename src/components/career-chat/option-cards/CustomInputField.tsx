
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface CustomInputFieldProps {
  customValue: string;
  handleCustomValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomSubmit: () => void;
  isSelecting: boolean;
}

export function CustomInputField({ 
  customValue, 
  handleCustomValueChange, 
  handleCustomSubmit,
  isSelecting
}: CustomInputFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customValue.trim() && !isSelecting) {
      handleCustomSubmit();
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        ref={inputRef}
        type="text"
        className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        value={customValue}
        onChange={handleCustomValueChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your custom answer..."
        disabled={isSelecting}
      />
      <Button 
        onClick={handleCustomSubmit} 
        disabled={!customValue.trim() || isSelecting}
      >
        {isSelecting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : null}
        Submit
      </Button>
    </div>
  );
}
