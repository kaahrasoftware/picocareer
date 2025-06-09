
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
      // First check if the value already exists
      const existingQuery = await supabase
        .from(tableName as any)
        .select('id, name, title')
        .or(`name.ilike.${customValue.trim()},title.ilike.${customValue.trim()}`)
        .limit(1);

      if (existingQuery.error) {
        console.error('Error checking existing data:', existingQuery.error);
        throw existingQuery.error;
      }

      const existingData = existingQuery.data?.[0];
      if (existingData) {
        // Use existing entry
        onValueChange(existingData.id.toString());
        setCustomValue('');
        setShowCustomInput(false);
        toast.success('Found existing entry');
        return;
      }

      // Create new entry
      const insertData = tableName === 'majors' || tableName === 'careers' 
        ? { title: customValue.trim() }
        : { name: customValue.trim() };

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select('id, name, title')
        .single();

      if (error) {
        console.error('Error adding new entry:', error);
        throw error;
      }

      if (data) {
        const newOption: Option = {
          id: data.id.toString(),
          name: data.name,
          title: data.title
        };

        setLocalOptions(prev => [...prev, newOption]);
        onValueChange(data.id.toString());
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
