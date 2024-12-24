import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InputField({ value, onChange, onSave, onCancel }: InputFieldProps) {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1"
      />
      <Button onClick={onSave} size="sm">
        Save
      </Button>
      <Button onClick={onCancel} variant="outline" size="sm">
        Cancel
      </Button>
    </div>
  );
}