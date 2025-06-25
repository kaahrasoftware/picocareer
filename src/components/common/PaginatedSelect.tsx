
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
import { StandardPagination } from "./StandardPagination";

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
  const [allOptions, setAllOptions] = useState<any[]>([]);
  const [showAllOptions, setShowAllOptions] = useState(false);
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
  
  // Calculate displayed options - either paginated or all loaded options
  const displayedOptions = showAllOptions && allOptions.length > 0 ? allOptions : paginatedOptions;
  
  // Function to load all options when needed
  const loadAllOptions = async () => {
    if (loadingAll) return;
    
    setLoadingAll(true);
    try {
      const allItems = await fetchAllFromTable(tableName, searchField);
      setAllOptions(allItems);
      setShowAllOptions(true);
      
      console.log(`Loaded ${allItems.length} items from ${tableName}`);
    } catch (error) {
      console.error(`Error loading all ${tableName}:`, error);
      setAllOptions([]);
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

  // Get display value for selected option
  const selectedOption = displayedOptions.find(option => option.id === value);
  const displayValue = selectedOption ? selectedOption[selectField] : '';

  return (
    <Select
      value={value}
      onValueChange={(newValue) => {
        if (newValue === "custom" && allowCustomValue) {
          setShowCustomInput(true);
        } else {
          onValueChange(newValue);
        }
      }}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {displayValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border shadow-lg">
        {/* Enhanced Search Input */}
        <div className="p-3 border-b bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
              onKeyDown={(e) => {
                // Prevent the select from closing on Enter key
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
            />
          </div>
          
          {/* Option Count Display */}
          {displayedOptions.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2 px-1">
              {showAllOptions ? (
                `Showing all ${displayedOptions.length} options`
              ) : (
                `Showing ${displayedOptions.length} of ${totalPages > 1 ? `${totalPages * 20}+` : displayedOptions.length} options`
              )}
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading options...</span>
            </div>
          ) : displayedOptions.length > 0 ? (
            <>
              {/* Options List */}
              <div className="py-1">
                {displayedOptions.map((option: any) => (
                  <SelectItem 
                    key={option.id} 
                    value={option.id}
                    className="hover:bg-gray-50 focus:bg-gray-50"
                  >
                    {option[selectField]}
                  </SelectItem>
                ))}
              </div>
              
              {/* Load More / Load All Buttons */}
              {!showAllOptions && (
                <div className="border-t bg-gray-50/30">
                  {page < totalPages && (
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs hover:bg-gray-100"
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
                  
                  {totalPages > 2 && (
                    <div className="p-2 pt-0">
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
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results found</p>
              {searchQuery && (
                <p className="text-xs mt-1">Try a different search term</p>
              )}
            </div>
          )}
          
          {/* Custom Value Option */}
          {allowCustomValue && (
            <div className="border-t bg-blue-50/50">
              <SelectItem 
                value="custom" 
                className="font-medium text-primary hover:bg-blue-100 focus:bg-blue-100"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-2">+</span>
                  Add Custom Value
                </div>
              </SelectItem>
            </div>
          )}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}
