
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface EditorProps {
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
}

export function Editor({ onChange, value, placeholder }: EditorProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder || "Enter content..."}
      className="min-h-[200px]"
    />
  );
}
