import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface Option {
  id: string;
  name?: string;
  title?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  tableName: string;
  allowCustom?: boolean;
}

export function CustomSelect({
  options,
  value,
  onValueChange,
  placeholder,
  tableName,
  allowCustom = true
}: CustomSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [localOptions, setLocalOptions] = useState<Option[]>(options);

  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleAddCustom = async () => {
    if (!customValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    setIsAdding(true);
    try {
      const validTableNames = ['majors', 'schools', 'companies', 'careers'];
      if (!validTableNames.includes(tableName)) {
        toast.error('Invalid table name');
        return;
      }

      const checkField = tableName === 'majors' || tableName === 'careers' ? 'title' : 'name';
      const { data: existingData, error: existingError } = await supabase
        .from(tableName as any)
        .select(`id, ${checkField}`)
        .eq(checkField, customValue.trim())
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing data:', existingError);
      }

      if (existingData && 'id' in existingData && existingData.id) {
        onValueChange(String(existingData.id));
        setCustomValue('');
        setShowCustomInput(false);
        toast.success('Found existing entry');
        return;
      }

      const insertData = tableName === 'majors' || tableName === 'careers' 
        ? { title: customValue.trim(), status: 'Pending' }
        : { name: customValue.trim(), status: 'Pending' };

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select(`id, ${checkField}`)
        .single();

      if (error) {
        console.error('Error adding new entry:', error);
        throw error;
      }

      if (data && 'id' in data && data.id) {
        const newOption: Option = {
          id: String(data.id),
          name: tableName !== 'majors' && tableName !== 'careers' ? (data as any)[checkField] : undefined,
          title: tableName === 'majors' || tableName === 'careers' ? (data as any)[checkField] : undefined
        };

        setLocalOptions(prev => [...prev, newOption]);
        onValueChange(String(data.id));
        setCustomValue('');
        setShowCustomInput(false);
        toast.success('Added successfully');
      }
    } catch (error) {
      console.error('Error in handleAddCustom:', error);
      toast.error('Failed to add entry');
    } finally {
      setIsAdding(false);
    }
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter new ${tableName.slice(0, -1)}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustom();
            } else if (e.key === 'Escape') {
              setShowCustomInput(false);
              setCustomValue('');
            }
          }}
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleAddCustom} 
            disabled={!customValue.trim() || isAdding}
            size="sm"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </Button>
          <Button 
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue('');
            }} 
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
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {localOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name || option.title || 'Unknown'}
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
          Add New
        </Button>
      )}
    </div>
  );
}
