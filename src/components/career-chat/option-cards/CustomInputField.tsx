
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomInputFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CustomInputField({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your answer...",
  autoFocus = true
}: CustomInputFieldProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <div className="w-full flex gap-2 mt-2">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1"
        onKeyPress={handleKeyPress}
        autoFocus={autoFocus}
      />
      <Button onClick={onSubmit} type="submit">
        Submit
      </Button>
    </div>
  );
}
