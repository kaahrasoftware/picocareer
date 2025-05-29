
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SelectOption {
  id: string;
  title?: string;
  name?: string;
}

interface SelectWithCustomOptionProps<T extends Record<string, any>> {
  selectedValue?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  tableName: string;
  className?: string;
}

export function SelectWithCustomOption<T extends Record<string, any>>({
  selectedValue,
  onValueChange,
  options,
  placeholder = "Select option...",
  tableName,
  className,
}: SelectWithCustomOptionProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [localOptions, setLocalOptions] = useState<SelectOption[]>(options);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const filteredOptions = localOptions.filter(option => {
    const displayName = option.title || option.name || '';
    return displayName.toLowerCase().includes(searchValue.toLowerCase());
  });

  const selectedOption = localOptions.find(option => option.id === selectedValue);
  const displayName = selectedOption?.title || selectedOption?.name || '';

  const handleCreateNew = async () => {
    if (!searchValue.trim()) return;

    setIsCreating(true);
    try {
      // Determine the field to insert based on existing options structure
      const insertField = options.some(opt => opt.title) ? 'title' : 'name';
      const insertData = { [insertField]: searchValue.trim() };

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select('id, title, name')
        .single();

      if (error) {
        console.error('Error creating new option:', error);
        toast.error('Failed to create new option');
        return;
      }

      if (data) {
        const newOption: SelectOption = {
          id: data.id,
          title: data.title,
          name: data.name,
        };
        
        setLocalOptions(prev => [...prev, newOption]);
        onValueChange(data.id);
        setSearchValue('');
        setOpen(false);
        toast.success('New option created successfully');
      }
    } catch (error) {
      console.error('Error creating new option:', error);
      toast.error('Failed to create new option');
    } finally {
      setIsCreating(false);
    }
  };

  const canCreateNew = searchValue.trim() && 
    !filteredOptions.some(option => {
      const optionName = option.title || option.name || '';
      return optionName.toLowerCase() === searchValue.toLowerCase();
    });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {displayName || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search options..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>
            {canCreateNew ? (
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleCreateNew}
                  disabled={isCreating}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? 'Creating...' : `Create "${searchValue}"`}
                </Button>
              </div>
            ) : (
              'No options found.'
            )}
          </CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option) => {
              const optionDisplayName = option.title || option.name || '';
              return (
                <CommandItem
                  key={option.id}
                  onSelect={() => {
                    onValueChange(option.id === selectedValue ? '' : option.id);
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {optionDisplayName}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
