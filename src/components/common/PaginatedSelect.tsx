
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
  
  const {
    data: options,
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
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            ref={searchInputRef}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : options.length > 0 ? (
            <>
              {options.map((option: any) => (
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
  );
}
