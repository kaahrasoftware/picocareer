
import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function SearchableSelect({
  options = [], // Default to empty array
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No option found.",
  className,
  disabled = false,
  loading = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Filter options based on search - safely handle undefined/null options
  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options) || !searchValue) return options || [];
    return options.filter(option =>
      option?.label?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  // Find selected option - safely handle undefined options
  const selectedOption = useMemo(() => {
    if (!Array.isArray(options)) return null;
    return options.find(option => option.value === value) || null;
  }, [options, value]);

  // Handle loading state or invalid data after all hooks are called
  if (loading || !Array.isArray(options)) {
    return (
      <Button
        variant="outline"
        role="combobox"
        disabled={true}
        className={cn("w-full justify-between", className)}
      >
        Loading...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  const handleSelect = (currentValue: string) => {
    // Find the actual option that matches this value
    const item = options?.find(option => option.value === currentValue);
    if (!item) return;
    
    const newValue = item.value === value ? '' : item.value;
    onValueChange(newValue);
    setOpen(false);
    setSearchValue('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        {Array.isArray(filteredOptions) && filteredOptions.length >= 0 ? (
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((item) => {
                if (!item || !item.value || !item.label) return null;
                return (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading options...
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
