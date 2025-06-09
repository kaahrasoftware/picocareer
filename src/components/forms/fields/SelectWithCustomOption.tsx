import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface Option {
  id: string;
  title?: string;
  name?: string;
}

interface SelectWithCustomOptionProps {
  selectedValue: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  tableName: string;
}

export function SelectWithCustomOption({
  selectedValue,
  value,
  onValueChange,
  options: initialOptions,
  placeholder,
  tableName
}: SelectWithCustomOptionProps) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Update filtered options when options change
  useEffect(() => {
    setOptions(initialOptions);
    setFilteredOptions(initialOptions);
  }, [initialOptions]);

  // Handle search input changes with debouncing
  const handleSearchChange = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setFilteredOptions(options);
      return;
    }
    
    setIsSearching(true);
    
    try {
      if (query.length >= 2) {
        const safeQuery = String(query).toLowerCase();
        
        const validTableNames = ['majors', 'schools', 'companies', 'careers'];
        if (!validTableNames.includes(tableName)) {
          const filtered = options.filter(option => {
            const searchValue = String(option.title || option.name || '').toLowerCase();
            return searchValue.includes(safeQuery);
          });
          setFilteredOptions(filtered);
          setIsSearching(false);
          return;
        }
        
        const { data, error } = await supabase
          .from(tableName as any)
          .select('id, title, name')
          .or(`title.ilike.%${safeQuery}%,name.ilike.%${safeQuery}%`)
          .limit(50);
        
        if (error) {
          console.error('Search error:', error);
          const filtered = options.filter(option => {
            const searchValue = String(option.title || option.name || '').toLowerCase();
            return searchValue.includes(safeQuery);
          });
          setFilteredOptions(filtered);
        } else if (data && Array.isArray(data) && data.length > 0) {
          const combinedOptions = [...options];
          data.forEach(item => {
            if (item && typeof item === 'object' && 'id' in item && item.id && 
                !combinedOptions.some(existing => existing.id === String(item.id))) {
              combinedOptions.push({
                id: String(item.id),
                title: item.title || undefined,
                name: item.name || undefined
              });
            }
          });
          
          const filtered = combinedOptions.filter(option => {
            const searchValue = String(option.title || option.name || '').toLowerCase();
            return searchValue.includes(safeQuery);
          });
          
          setFilteredOptions(filtered);
        } else {
          const filtered = options.filter(option => {
            const searchValue = String(option.title || option.name || '').toLowerCase();
            return searchValue.includes(safeQuery);
          });
          setFilteredOptions(filtered);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      const filtered = options.filter(option => {
        const searchValue = String(option.title || option.name || '').toLowerCase();
        return searchValue.includes(query.toLowerCase());
      });
      setFilteredOptions(filtered);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  // Focus the search input when content opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Use a short timeout to ensure the select content is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    } else {
      setSearchQuery("");
    }
  };

  const handleAddCustom = async () => {
    if (!customValue.trim()) {
      toast.error('Please enter a value');
      return;
    }

    setIsLoading(true);
    try {
      const validTableNames = ['majors', 'schools', 'companies', 'careers'];
      if (!validTableNames.includes(tableName)) {
        toast.error('Invalid table name');
        return;
      }

      const { data: existingData, error: checkError } = await supabase
        .from(tableName as any)
        .select('id, title, name')
        .or(`title.eq.${customValue},name.eq.${customValue}`)
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
      }

      if (existingData && existingData.id) {
        onValueChange(String(existingData.id));
        setShowCustomInput(false);
        setCustomValue('');
        return;
      }

      const insertData = tableName === 'majors' || tableName === 'careers' 
        ? { 
            title: customValue,
            description: `Custom ${tableName === 'majors' ? 'major' : 'position'}: ${customValue}`,
            status: 'Pending'
          }
        : { 
            name: customValue,
            status: 'Pending'
          };

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select('id, title, name')
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      toast.success(`Successfully added new ${tableName === 'companies' ? 'company' : 
                   tableName === 'schools' ? 'school' : 
                   tableName === 'majors' ? 'major' : 'position'}.`);

      if (data && data.id) {
        const newOption: Option = {
          id: String(data.id),
          title: data.title || undefined,
          name: data.name || undefined
        };

        setOptions(prev => [...prev, newOption]);
        onValueChange(String(data.id));
      }
      
      setShowCustomInput(false);
      setCustomValue('');
    } catch (error) {
      console.error(`Failed to add new ${tableName}:`, error);
      toast.error(`Failed to add new ${tableName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter ${tableName === 'companies' ? 'company' : 
                       tableName === 'schools' ? 'school' : 
                       tableName === 'majors' ? 'major' : 'position'} name`}
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleAddCustom}
            size="sm"
            type="button"
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
          <Button
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
            }}
            variant="outline"
            size="sm"
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Ensure value exists in options before using it
  const isValidValue = value && options.some(option => option.id === value);

  return (
    <div className="w-full">
      <Select
        value={isValidValue ? value : undefined}
        onValueChange={(newValue) => {
          if (newValue === "other") {
            setShowCustomInput(true);
          } else {
            onValueChange(newValue);
          }
        }}
        onOpenChange={handleOpenChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent ref={contentRef}>
          <div className="p-2">
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearchChange(e.target.value);
              }}
              className="mb-2"
              onKeyDown={(e) => {
                // Prevent the select from closing on Enter key
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          <ScrollArea className="h-[200px]">
            {isSearching ? (
              <div className="p-2 text-center text-muted-foreground">Searching...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.title || option.name || ''}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">No results found</div>
            )}
            <SelectItem value="other">Other (Add New)</SelectItem>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
