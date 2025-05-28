
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface SelectOption {
  id: string;
  title?: string;
  name?: string;
}

interface SelectWithCustomOptionProps {
  table: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectWithCustomOption({
  table,
  value,
  onValueChange,
  placeholder = "Select an option",
  disabled = false
}: SelectWithCustomOptionProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: fetchedOptions = [], isLoading, refetch } = useQuery({
    queryKey: [table, 'select-options'],
    queryFn: async (): Promise<SelectOption[]> => {
      try {
        // Type-safe query building for known tables
        if (table === 'careers') {
          const { data, error } = await supabase
            .from('careers')
            .select('id, title')
            .order('title');
          
          if (error) throw error;
          return (data || []).map(item => ({ id: item.id, title: item.title }));
        }
        
        if (table === 'companies') {
          const { data, error } = await supabase
            .from('companies')
            .select('id, name')
            .order('name');
          
          if (error) throw error;
          return (data || []).map(item => ({ id: item.id, name: item.name }));
        }
        
        if (table === 'schools') {
          const { data, error } = await supabase
            .from('schools')
            .select('id, name')
            .order('name');
          
          if (error) throw error;
          return (data || []).map(item => ({ id: item.id, name: item.name }));
        }
        
        if (table === 'majors') {
          const { data, error } = await supabase
            .from('majors')
            .select('id, title')
            .order('title');
          
          if (error) throw error;
          return (data || []).map(item => ({ id: item.id, title: item.title }));
        }
        
        return [];
      } catch (error) {
        console.error(`Error in query for ${table}:`, error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  useEffect(() => {
    setOptions(fetchedOptions);
  }, [fetchedOptions]);

  const handleCreateNew = async () => {
    if (!newItemName.trim()) return;
    
    setIsCreating(true);
    try {
      if (table === 'careers') {
        const { data, error } = await supabase
          .from('careers')
          .insert([{ title: newItemName.trim(), description: `Custom ${table} entry` }])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const newOption: SelectOption = { id: data.id, title: data.title };
          setOptions(prev => [...prev, newOption]);
          onValueChange(data.id);
          setNewItemName('');
          setIsDialogOpen(false);
          refetch();
        }
      } else {
        // Handle other table types as needed
        const insertData = { name: newItemName.trim() };
        
        if (table === 'companies') {
          const { data, error } = await supabase
            .from('companies')
            .insert([insertData])
            .select()
            .single();

          if (error) throw error;
          if (data) {
            const newOption: SelectOption = { id: data.id, name: data.name };
            setOptions(prev => [...prev, newOption]);
            onValueChange(data.id);
            setNewItemName('');
            setIsDialogOpen(false);
            refetch();
          }
        }
      }
    } catch (error) {
      console.error(`Error creating new ${table}:`, error);
    } finally {
      setIsCreating(false);
    }
  };

  const displayValue = options.find(option => option.id === value);
  const displayText = displayValue ? (displayValue.title || displayValue.name) : placeholder;

  return (
    <div className="flex gap-2">
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder}>
            {displayText}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.title || option.name}
            </SelectItem>
          ))}
          {options.length === 0 && !isLoading && (
            <SelectItem value="" disabled>
              No options available
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {table.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder={`Enter ${table.slice(0, -1)} name`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateNew();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNewItemName('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateNew}
                disabled={!newItemName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
