
import React, { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

interface Option {
  id: string;
  name?: string;
  title?: string;
}

interface PaginatedSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
}

export function PaginatedSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  pageSize = 50
}: PaginatedSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter options based on search
  const filteredOptions = options.filter(option => {
    const displayText = option.name || option.title || '';
    return displayText.toLowerCase().includes(search.toLowerCase());
  });

  // Paginate filtered results
  const totalPages = Math.ceil(filteredOptions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOptions = filteredOptions.slice(startIndex, endIndex);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Find selected option
  const selectedOption = options.find(option => option.id === value);
  const displayValue = selectedOption ? (selectedOption.name || selectedOption.title) : placeholder;

  const handleSelect = (optionId: string) => {
    onValueChange(optionId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {paginatedOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={() => handleSelect(option.id)}
                  className="cursor-pointer"
                >
                  {option.name || option.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-3 py-2">
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredOptions.length} results)
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-7 px-2"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
