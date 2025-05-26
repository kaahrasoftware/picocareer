
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  [key: string]: any;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  displayField?: string;
  valueField?: string;
  className?: string;
}

export function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  displayField = "name",
  valueField = "id",
  className
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);

  useEffect(() => {
    // Ensure options is an array and filter out any invalid entries
    const validOptions = Array.isArray(options) ? options.filter(option => 
      option && typeof option === 'object' && option.id
    ) : [];
    setFilteredOptions(validOptions);
  }, [options]);

  const selectedOption = filteredOptions.find(option => option[valueField] === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedOption ? selectedOption[displayField] : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option[valueField]}
                value={option[displayField]}
                onSelect={() => {
                  onChange(option[valueField]);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option[valueField] ? "opacity-100" : "opacity-0"
                  )}
                />
                {option[displayField]}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
