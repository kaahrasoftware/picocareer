
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X } from 'lucide-react';
import { useFieldOptions } from './useFieldOptions';
import { FieldName } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SelectWithCustomOptionProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  fieldName: FieldName;
}

export function SelectWithCustomOption({
  value,
  onValueChange,
  placeholder,
  fieldName
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: options = [], isLoading, refetch } = useFieldOptions(fieldName);
  const { toast } = useToast();

  const handleCreateCustom = async () => {
    if (!customValue.trim()) return;
    
    setIsCreating(true);
    try {
      let insertData: any = { status: 'Pending' };
      let tableName = '';
      
      switch (fieldName) {
        case 'career_id':
          tableName = 'careers';
          insertData = { title: customValue, description: customValue, ...insertData };
          break;
        case 'company_id':
          tableName = 'companies';
          insertData = { name: customValue, ...insertData };
          break;
        case 'school_id':
          tableName = 'schools';
          insertData = { name: customValue, ...insertData };
          break;
        case 'academic_major_id':
          tableName = 'majors';
          insertData = { title: customValue, description: customValue, ...insertData };
          break;
        default:
          tableName = 'careers';
          insertData = { title: customValue, description: customValue, ...insertData };
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${customValue} has been added and is pending approval.`
      });

      onValueChange(data.id);
      setCustomValue('');
      setShowCustomInput(false);
      refetch();
    } catch (error) {
      console.error('Error creating custom option:', error);
      toast({
        title: 'Error',
        description: 'Failed to create custom option. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedOption = options.find(option => option.id === value);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder}>
            {selectedOption?.title || selectedOption?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.title || option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!showCustomInput ? (
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
      ) : (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Enter custom option"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateCustom();
              }
              if (e.key === 'Escape') {
                setShowCustomInput(false);
                setCustomValue('');
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleCreateCustom}
            disabled={!customValue.trim() || isCreating}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue('');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
