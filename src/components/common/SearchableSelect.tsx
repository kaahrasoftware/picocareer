
import { useState, useEffect, useRef } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  tableName: string;
  selectField: string;
  searchField: string;
  allowCustomValue?: boolean;
  onCustomValueSubmit?: (value: string) => Promise<void>;
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder,
  tableName,
  selectField,
  searchField,
  allowCustomValue = false,
  onCustomValueSubmit
}: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const { toast } = useToast();
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Paginated query with search
  const {
    data: options,
    isLoading,
    page,
    setPage,
    totalPages,
  } = usePaginatedQuery({
    queryKey: [tableName, 'select', debouncedSearch],
    tableName,
    paginationOptions: {
      limit: 20,
      page: 1,
      searchQuery: debouncedSearch,
      searchColumn: searchField,
      orderBy: searchField,
      orderDirection: 'asc'
    },
    filters: { status: 'Approved' },
    queryOptions: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  });
  
  // Handle custom value input
  const handleCustomSubmit = async () => {
    if (!customValue.trim() || !onCustomValueSubmit) return;
    
    try {
      await onCustomValueSubmit(customValue);
      setShowCustomInput(false);
      setCustomValue("");
    } catch (error) {
      console.error("Error submitting custom value:", error);
    }
  };
  
  // Get display name for the selected value
  const getDisplayName = () => {
    if (!value) return "";
    
    const selectedOption = options?.find(option => option.id === value);
    if (selectedOption) {
      const displayName = selectedOption[selectField];
      setSelectedLabel(displayName);
      return displayName;
    }
    
    // If we have a value but can't find the option, fetch it
    if (value && options?.length > 0 && !isLoading && !selectedLabel) {
      fetchSelectedItem();
    }
    
    return selectedLabel;
  };
  
  // Fetch the selected item details if not in the current options list
  const fetchSelectedItem = async () => {
    if (!value) return;
    
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

  // Initial load of selected item
  useEffect(() => {
    if (value && !selectedLabel && !isLoading) {
      fetchSelectedItem();
    }
  }, [value, isLoading]);
  
  // Display name
  const displayName = getDisplayName();
  
  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter new ${tableName.slice(0, -1)} name`}
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
    <div className="space-y-2">
      <div className="flex flex-col space-y-2">
        <Input
          placeholder={`Search ${placeholder.toLowerCase()}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        
        <Select
          value={value}
          onValueChange={(newValue) => {
            if (newValue === "custom" && allowCustomValue) {
              setShowCustomInput(true);
            } else {
              onValueChange(newValue);
              // Find and set the label from options
              const option = options?.find(opt => opt.id === newValue);
              if (option) {
                setSelectedLabel(option[selectField]);
              }
            }
          }}
          onOpenChange={setIsSelectOpen}
          open={isSelectOpen}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder}>
              {displayName || placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : options && options.length > 0 ? (
                <>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option[selectField]}
                    </SelectItem>
                  ))}
                  {page < totalPages && (
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPage(page + 1);
                        }}
                      >
                        Load more results
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-2 text-center text-muted-foreground">
                  No results found
                </div>
              )}
              
              {allowCustomValue && (
                <SelectItem value="custom" className="font-medium text-primary">
                  + Add Custom Value
                </SelectItem>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
