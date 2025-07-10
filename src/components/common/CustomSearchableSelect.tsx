import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  allowCustom?: boolean;
  onAddCustom?: (customValue: string) => Promise<void>;
  customOptionLabel?: string;
}

export function CustomSearchableSelect({
  options = [],
  value,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  className,
  disabled = false,
  loading = false,
  allowCustom = false,
  onAddCustom,
  customOptionLabel = "Add"
}: CustomSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!Array.isArray(options)) return [];
    if (!searchValue.trim()) return options;
    
    return options.filter(option => 
      option?.label?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  // Find selected option
  const selectedOption = useMemo(() => {
    if (!Array.isArray(options)) return null;
    return options.find(option => option.value === value) || null;
  }, [options, value]);

  // Handle selection
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearchValue("");
    setIsAddingCustom(false);
  };

  // Handle adding custom option
  const handleAddCustom = async () => {
    if (!onAddCustom || !searchValue.trim()) return;
    
    setIsAddingCustom(true);
    try {
      await onAddCustom(searchValue.trim());
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding custom option:", error);
    } finally {
      setIsAddingCustom(false);
    }
  };

  // Check if search value exactly matches an existing option
  const hasExactMatch = useMemo(() => {
    if (!searchValue.trim()) return false;
    return filteredOptions.some(option => 
      option.label.toLowerCase() === searchValue.toLowerCase()
    );
  }, [filteredOptions, searchValue]);

  // Show add custom option when allowed and no exact match found
  const showAddCustom = allowCustom && searchValue.trim() && !hasExactMatch && !isAddingCustom;

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchValue("");
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpen(false);
      setSearchValue("");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={false}
        type="button"
        className={cn("w-full justify-between", className)}
        disabled
      >
        <span className="text-muted-foreground">Loading...</span>
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        type="button"
        className="w-full justify-between"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", open && "rotate-180")} />
      </Button>
      
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-2 py-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
              onKeyDown={handleKeyDown}
            />
          </div>
          
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 && !showAddCustom ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                ))}
                
                {showAddCustom && (
                  <div
                    className="flex items-center px-2 py-2 text-sm cursor-pointer rounded-sm hover:bg-accent hover:text-accent-foreground border-t"
                    onClick={handleAddCustom}
                  >
                    {isAddingCustom ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <div className="mr-2 h-4 w-4 flex items-center justify-center text-primary">+</div>
                    )}
                    {customOptionLabel} "{searchValue}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}