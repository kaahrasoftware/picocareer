import React from 'react';
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/forms/RichTextEditor";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function InputField({ value, onChange, onSave, onCancel }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder="Enter text..."
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