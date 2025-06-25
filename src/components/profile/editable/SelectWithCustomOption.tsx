
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SelectWithCustomOptionProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder?: string;
  allowCustom?: boolean;
}

export function SelectWithCustomOption({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  allowCustom = true
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onValueChange(customValue.trim());
      setCustomValue('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-2">
      {!showCustomInput ? (
        <div className="space-y-2">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.title || option.name || option.id}>
                  {option.title || option.name || option.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {allowCustom && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomInput(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Option
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Enter custom option"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCustomSubmit();
              }
            }}
          />
          <Button type="button" onClick={handleCustomSubmit} size="sm">
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue('');
            }}
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
