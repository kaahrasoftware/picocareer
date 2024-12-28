import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InputField({ value, onChange, onSave, onCancel }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text..."
        className="min-h-[100px] bg-gray-50 rounded-md"
      />
      <div className="flex gap-2 justify-end">
        <Button onClick={onSave} size="sm">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}