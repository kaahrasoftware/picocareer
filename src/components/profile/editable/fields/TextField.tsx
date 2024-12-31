import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TextFieldProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  onCancel: () => void;
}

export function TextField({ value, onSave, onCancel }: TextFieldProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="sm">Save</Button>
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}