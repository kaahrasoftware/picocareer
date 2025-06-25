
import { useState, useEffect, useRef } from "react";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { fetchAllFromTable } from "@/hooks/useAllReferenceData";
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
import { Loader2, Search } from "lucide-react";

interface PaginatedSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  tableName: string;
  selectField: string;
  searchField: string;
  allowCustomValue?: boolean;
  onCustomValueSubmit?: (value: string) => Promise<void>;
}

export function PaginatedSelect({
  value,
  onValueChange,
  placeholder,
  tableName,
  selectField,
  searchField,
  allowCustomValue = false,
  onCustomValueSubmit
}: PaginatedSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [loadingAll, setLoadingAll] = useState(false);
  const [allOptionsLoaded, setAllOptionsLoaded] = useState(false);
  const [displayedOptions, setDisplayedOptions] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Clear search when selecting a value
  useEffect(() => {
    if (value) {
      setSearchQuery("");
      setDebouncedSearch("");
    }
  }, [value]);
  
  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Initial paginated results
  const {
    data: paginatedOptions,
    isLoading,
    page,
    setPage,
    totalPages,
  } = usePaginatedQuery<any>({
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

  // Update displayed options when paginated data changes
  useEffect(() => {
    if (paginatedOptions && !allOptionsLoaded) {
      setDisplayedOptions(paginatedOptions);
    }
  }, [paginatedOptions, allOptionsLoaded]);
  
  // Function to load all options when needed
  const loadAllOptions = async () => {
    if (loadingAll || allOptionsLoaded) return;
    
    setLoadingAll(true);
    try {
      const allItems = await fetchAllFromTable(tableName, searchField);
      // Filter approved items
      const approvedItems = allItems.filter(item => item.status === 'Approved');
      setDisplayedOptions(approvedItems);
      setAllOptionsLoaded(true);
    } catch (error) {
      console.error(`Error loading all ${tableName}:`, error);
    } finally {
      setLoadingAll(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    } else {
      // Reset search when dropdown closes
      setSearchQuery("");
      setDebouncedSearch("");
      setAllOptionsLoaded(false);
    }
  };
  
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
  
  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter ${tableName.slice(0, -1)} name`}
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

  // Find the selected option to display its label
  const selectedOption = displayedOptions.find(option => option[selectField] === value);
  const displayValue = selectedOption ? selectedOption[selectField] : value;

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        if (newValue === "custom" && allowCustomValue) {
          setShowCustomInput(true);
        } else {
          // Pass the actual display name, not the ID
          const selectedItem = displayedOptions.find(option => option.id === newValue);
          const displayName = selectedItem ? selectedItem[selectField] : newValue;
          onValueChange(displayName);
        }
      }}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {displayValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {/* Enhanced Search Input */}
        <div className="p-3 border-b bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={`Search ${tableName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          {displayedOptions.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {allOptionsLoaded 
                ? `Showing all ${displayedOptions.length} options`
                : `Showing ${displayedOptions.length} of ${totalPages * 20}${totalPages > 3 ? '+' : ''} options`
              }
            </div>
          )}
        </div>

        <ScrollArea className="h-[250px]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading options...</span>
            </div>
          ) : displayedOptions.length > 0 ? (
            <div className="p-1">
              {displayedOptions.map((option: any) => (
                <SelectItem key={option.id} value={option.id} className="cursor-pointer">
                  <div className="flex flex-col">
                    <span>{option[selectField]}</span>
                    {option.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
              
              {/* Load More / Load All Options */}
              {!allOptionsLoaded && (
                <div className="p-2 space-y-2 border-t">
                  {page < totalPages && (
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
                  )}
                  {totalPages > 2 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        loadAllOptions();
                      }}
                      disabled={loadingAll}
                    >
                      {loadingAll ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Loading all options...
                        </>
                      ) : (
                        "Load all options"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">No results found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
          
          {/* Add Custom Value Option */}
          {allowCustomValue && (
            <div className="p-1 border-t bg-muted/5">
              <SelectItem 
                value="custom" 
                className="font-medium text-primary cursor-pointer border border-dashed border-primary/30 rounded"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">+</span>
                  <span>Add Custom Value</span>
                </div>
              </SelectItem>
            </div>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
