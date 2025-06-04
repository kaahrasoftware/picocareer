
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Option {
  id: string;
  title?: string;
  name?: string;
}

interface SelectWithCustomOptionProps {
  selectedValue: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  tableName: string;
}

export function SelectWithCustomOption({
  selectedValue,
  value,
  onValueChange,
  options: initialOptions,
  placeholder,
  tableName
}: SelectWithCustomOptionProps) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleAddCustom = async () => {
    if (!customValue.trim()) return;

    setIsLoading(true);
    try {
      console.log(`Adding new ${tableName} entry:`, customValue);
      
      // Add new entry to the database
      const { data, error } = await supabase
        .from(tableName)
        .insert({ 
          title: customValue,
          name: customValue
        })
        .select()
        .single();

      if (error) {
        console.error(`Error adding ${tableName}:`, error);
        toast.error(`Failed to add new ${tableName}`);
        return;
      }

      if (data) {
        console.log(`Successfully added ${tableName}:`, data);
        
        // Create normalized option object
        const newOption: Option = {
          id: data.id,
          title: data.title || data.name,
          name: data.name || data.title
        };

        // Update options list
        setOptions(prev => [...prev, newOption]);
        
        // Select the newly added option
        onValueChange(data.id);
        
        // Reset form
        setCustomValue('');
        setShowCustomInput(false);
        
        toast.success(`New ${tableName} added successfully`);
      }
    } catch (error) {
      console.error(`Error adding ${tableName}:`, error);
      toast.error(`Failed to add new ${tableName}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCustomValue('');
    setShowCustomInput(false);
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter new ${tableName}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustom();
            } else if (e.key === 'Escape') {
              handleCancel();
            }
          }}
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleAddCustom} 
            disabled={!customValue.trim() || isLoading}
            size="sm"
          >
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            size="sm"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select onValueChange={onValueChange} value={value || selectedValue}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.title || option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowCustomInput(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New {tableName}
      </Button>
    </div>
  );
}
