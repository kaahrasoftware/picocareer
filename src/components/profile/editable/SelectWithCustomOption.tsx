
import React, { useState, useEffect, useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { TableName, FieldName, TitleField, InsertData, Status } from "./types";

interface SelectWithCustomOptionProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string; }>;
  placeholder: string;
  handleSelectChange: (name: string, value: string) => void;
  tableName: TableName;
  fieldName: FieldName;
  titleField: TitleField;
  onCancel?: () => void;
}

export function SelectWithCustomOption({ 
  value = "", 
  options = [],
  placeholder,
  handleSelectChange,
  tableName,
  fieldName,
  titleField,
  onCancel
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Update filtered options when options change
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Handle search input changes with debouncing
  const handleSearchChange = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setFilteredOptions(options);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // For longer queries, fetch from database
      if (query.length >= 2) {
        const safeQuery = String(query).toLowerCase();
        
        let supabaseQuery = supabase
          .from(tableName)
          .select(`id, ${titleField}`)
          .limit(50);
        
        if (titleField === 'title') {
          supabaseQuery = supabaseQuery.ilike('title', `%${safeQuery}%`);
        } else {
          supabaseQuery = supabaseQuery.ilike('name', `%${safeQuery}%`);
        }
        
        const { data, error } = await supabaseQuery;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Combine with existing options, removing duplicates
          const combinedOptions = [...options];
          data.forEach(item => {
            if (!combinedOptions.some(existing => existing.id === item.id)) {
              combinedOptions.push(item);
            }
          });
          
          // Filter the combined results
          const filtered = combinedOptions.filter(option => {
            const searchValue = String(option[titleField] || '').toLowerCase();
            return searchValue.includes(safeQuery);
          });
          
          setFilteredOptions(filtered);
        } else {
          // If no results from API, filter local options
          const filtered = options.filter(option => {
            const searchValue = String(option[titleField] || '').toLowerCase();
            return searchValue.includes(safeQuery);
          });
          setFilteredOptions(filtered);
        }
      } else {
        // For short queries just filter the local options
        const filtered = options.filter(option => {
          const searchValue = String(option[titleField] || '').toLowerCase();
          return searchValue.includes(query.toLowerCase());
        });
        setFilteredOptions(filtered);
      }
    } catch (error) {
      console.error(`Search error:`, error);
      // Fall back to local filtering on error
      const filtered = options.filter(option => {
        const searchValue = String(option[titleField] || '').toLowerCase();
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

  const handleCustomSubmit = async () => {
    if (!customValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if entry already exists
      const { data: existingData, error: checkError } = await supabase
        .from(tableName)
        .select(`id, ${titleField}`)
        .eq(titleField, customValue)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingData) {
        handleSelectChange(fieldName, existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // Create new entry
      const insertData: InsertData[typeof tableName] = {
        status: 'Pending' as Status,
        ...(tableName === 'majors' || tableName === 'careers' 
          ? {
              title: customValue,
              description: `Custom ${tableName === 'majors' ? 'major' : 'position'}: ${customValue}`
            }
          : {
              name: customValue
            })
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully added new ${tableName === 'companies' ? 'company' : 
                     tableName === 'schools' ? 'school' : 
                     tableName === 'majors' ? 'major' : 'position'}.`,
      });

      handleSelectChange(fieldName, data.id);
      setShowCustomInput(false);
      setCustomValue("");
    } catch (error) {
      console.error(`Failed to add new ${tableName}:`, error);
      toast({
        title: "Error",
        description: `Failed to add new ${tableName}. Please try again.`,
        variant: "destructive",
      });
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
            onClick={handleCustomSubmit}
            size="sm"
            type="button"
          >
            Add
          </Button>
          <Button
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
              if (onCancel) onCancel();
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
            handleSelectChange(fieldName, newValue);
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
                  {option[titleField] || ''}
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
