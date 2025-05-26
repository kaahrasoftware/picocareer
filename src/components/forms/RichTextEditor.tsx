
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  rows?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter your content...",
  label,
  required = false,
  rows = 6
}: RichTextEditorProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="rich-text-editor">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Textarea
        id="rich-text-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="min-h-[150px] resize-vertical"
      />
    </div>
  );
}
