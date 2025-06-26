
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectWithCustomOption } from "./SelectWithCustomOption";

interface InputFieldProps {
  type: 'text' | 'number' | 'select';
  value: string;
  options?: Array<{ id: string; title?: string; name?: string }>;
  placeholder?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function InputField({ 
  type, 
  value, 
  options = [], 
  placeholder = '', 
  onSave, 
  onCancel 
}: InputFieldProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
  };

  if (type === 'select') {
    return (
      <SelectWithCustomOption
        value={value}
        options={options}
        placeholder={placeholder}
        handleSelectChange={(_, newValue) => onSave(newValue)}
        fieldName="companies"
        titleField="name"
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        type={type}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button onClick={handleSave} size="sm">
        Save
      </Button>
      <Button onClick={onCancel} variant="outline" size="sm">
        Cancel
      </Button>
    </div>
  );
}
