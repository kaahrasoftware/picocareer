import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SelectFieldProps {
  value: string;
  options: readonly string[] | Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function SelectField({ value, options, placeholder, onSave, onCancel }: SelectFieldProps) {
  const isStringArray = (arr: any[]): arr is string[] => {
    return typeof arr[0] === 'string';
  };

  return (
    <div className="flex gap-2">
      <Select 
        value={value} 
        onValueChange={(value) => onSave(value)}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isStringArray(options) ? (
            options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.title || option.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Button 
        onClick={onCancel} 
        variant="outline" 
        size="sm"
      >
        Cancel
      </Button>
    </div>
  );
}