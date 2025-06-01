
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SelectWithCustomOptionProps<T> {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  tableName: string;
}

export function SelectWithCustomOption<T extends Record<string, any>>({
  selectedValue,
  onValueChange,
  options,
  placeholder,
  tableName
}: SelectWithCustomOptionProps<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allOptions, setAllOptions] = useState(options);
  const { toast } = useToast();

  useEffect(() => {
    setAllOptions(options);
  }, [options]);

  const handleAddCustomOption = async () => {
    if (!customValue.trim()) return;

    setIsLoading(true);
    try {
      let insertData: any = {};
      
      // Determine the correct field name based on existing options
      if (options.length > 0) {
        const firstOption = options[0];
        if ('title' in firstOption) {
          insertData.title = customValue.trim();
        } else if ('name' in firstOption) {
          insertData.name = customValue.trim();
        }
      } else {
        // Default to title
        insertData.title = customValue.trim();
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object' && 'id' in data) {
        const newOption = {
          id: data.id as string,
          title: (data as any).title as string | undefined,
          name: (data as any).name as string | undefined
        };

        setAllOptions(prev => [...prev, newOption]);
        onValueChange(data.id as string);
        setCustomValue('');
        setIsDialogOpen(false);
        
        toast({
          title: "Success",
          description: "New option added successfully",
        });
      }
    } catch (error) {
      console.error('Error adding custom option:', error);
      toast({
        title: "Error",
        description: "Failed to add new option",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayValue = (option: { id: string; title?: string; name?: string }) => {
    return option.title || option.name || option.id;
  };

  const selectedOption = allOptions.find(option => option.id === selectedValue);

  return (
    <div className="flex gap-2">
      <Select value={selectedValue} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder}>
            {selectedOption ? getDisplayValue(selectedOption) : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {getDisplayValue(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Option</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Enter new option"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCustomOption} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
