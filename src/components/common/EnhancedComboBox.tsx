
import { useState, useEffect, useRef } from "react";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EnhancedComboBoxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  tableName: string;
  selectField: string;
  searchField: string;
  allowCustomValue?: boolean;
  onCustomValueSubmit?: (value: string) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function EnhancedComboBox({
  value,
  onValueChange,
  placeholder,
  tableName,
  selectField,
  searchField,
  allowCustomValue = false,
  onCustomValueSubmit,
  className,
  disabled = false,
}: EnhancedComboBoxProps) {
  // State
  const [open, setOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<{ id: string; [key: string]: any }[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();

  // Fetch initial data for the selected value if needed
  useEffect(() => {
    if (value && !selectedLabel) {
      fetchSelectedItem();
    }
  }, [value]);

  // Fetch options when search query changes
  const fetchOptions = useDebouncedCallback(async (query: string, pageNum: number = 1) => {
    if (disabled) return;
    
    setIsLoading(true);
    try {
      const start = (pageNum - 1) * 20;
      const end = start + 19;
      
      let supabaseQuery = supabase
        .from(tableName)
        .select(`id, ${selectField}`)
        .eq('status', 'Approved')
        .order(searchField, { ascending: true })
        .range(start, end);
      
      if (query) {
        supabaseQuery = supabaseQuery.ilike(searchField, `%${query}%`);
      }
      
      const { data, error } = await supabaseQuery;
      
      if (error) throw error;
      
      if (pageNum === 1) {
        setOptions(data || []);
      } else {
        setOptions(prev => [...prev, ...(data || [])]);
      }
      
      // Check if there are more results
      setHasMore(data && data.length === 20);
      
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  // Fetch more items when scrolling
  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOptions(searchQuery, nextPage);
    }
  };

  // Fetch the selected item details
  const fetchSelectedItem = async () => {
    if (!value || selectedLabel) return;
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select(`id, ${selectField}`)
        .eq('id', value)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSelectedLabel(data[selectField]);
      }
    } catch (error) {
      console.error(`Error fetching ${tableName} item:`, error);
    }
  };

  // Initialize search when popover opens
  useEffect(() => {
    if (open && !showCustomInput) {
      setSearchQuery("");
      setPage(1);
      fetchOptions("", 1);
    }
  }, [open]);

  // Handle custom value submission
  const handleCustomSubmit = async () => {
    if (!customValue.trim() || !onCustomValueSubmit) {
      toast({
        title: "Error",
        description: "Please enter a value",
        variant: "destructive",
      });
      return;
    }

    try {
      await onCustomValueSubmit(customValue);
      setShowCustomInput(false);
      setCustomValue("");
    } catch (error) {
      console.error("Error submitting custom value:", error);
    }
  };

  // If we're showing the custom input form
  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter new ${tableName.slice(0, -1)} name`}
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleCustomSubmit}
            size="sm"
          >
            Add
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value && selectedLabel ? selectedLabel : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${tableName}...`} 
            value={searchQuery}
            onValueChange={(search) => {
              setSearchQuery(search);
              setPage(1);
              fetchOptions(search, 1);
            }}
          />
          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          <CommandList>
            <CommandEmpty>
              {searchQuery.length > 0 ? (
                <div className="py-3 text-center text-sm">
                  No results found
                  {allowCustomValue && (
                    <Button
                      variant="link"
                      onClick={() => {
                        setOpen(false);
                        setShowCustomInput(true);
                        setCustomValue(searchQuery);
                      }}
                      className="ml-1"
                    >
                      Add "{searchQuery}"
                    </Button>
                  )}
                </div>
              ) : (
                "No options available"
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setSelectedLabel(option[selectField]);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option[selectField]}
                </CommandItem>
              ))}
              {hasMore && (
                <div className="p-1 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      loadMoreItems();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      "Load more results"
                    )}
                  </Button>
                </div>
              )}
            </CommandGroup>
            {allowCustomValue && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCustomInput(true);
                  }}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add custom {tableName.slice(0, -1)}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
