
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface SimpleSchool {
  id: string;
  name: string;
  location?: string;
}

interface SimpleSchoolSelectorProps {
  value?: SimpleSchool | null;
  onValueChange: (school: SimpleSchool | null) => void;
  disabled?: boolean;
}

export function SimpleSchoolSelector({ value, onValueChange, disabled }: SimpleSchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState("");

  // Initialize input value from prop
  useEffect(() => {
    if (value) {
      setInputValue(value.name);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Debounced search to avoid too many API calls
  const debouncedSetSearch = useDebouncedCallback((query: string) => {
    setSearchTerm(query);
  }, 300);

  // Simple school search query
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['simple-schools-search', searchTerm],
    queryFn: async (): Promise<SimpleSchool[]> => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name, state, country')
          .eq('status', 'Approved')
          .ilike('name', `%${searchTerm}%`)
          .order('name')
          .limit(20);
        
        if (error) {
          console.error('Error fetching schools:', error);
          return [];
        }
        
        // Transform to SimpleSchool format
        return (data || []).map(school => ({
          id: school.id,
          name: school.name || 'Unknown School',
          location: [school.state, school.country].filter(Boolean).join(', ') || undefined
        }));
      } catch (error) {
        console.error('School search failed:', error);
        return [];
      }
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
  });

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSetSearch(value);
    
    // If input is cleared, clear the selection
    if (!value) {
      onValueChange(null);
    }
  };

  const handleSchoolSelect = (school: SimpleSchool) => {
    setInputValue(school.name);
    onValueChange(school);
    setOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    setSearchTerm("");
    onValueChange(null);
  };

  const handleManualEntry = () => {
    if (inputValue.trim() && !value) {
      // Create a manual entry
      const manualSchool: SimpleSchool = {
        id: `manual-${Date.now()}`,
        name: inputValue.trim(),
        location: "User Entered"
      };
      onValueChange(manualSchool);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type to search schools..."
              disabled={disabled}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <ChevronsUpDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto">
            {searchTerm.length < 2 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </div>
            ) : isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching schools...
              </div>
            ) : schools.length === 0 ? (
              <div className="p-2">
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No schools found
                </div>
                {inputValue.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualEntry}
                    className="w-full mt-2"
                  >
                    Add "{inputValue}" manually
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-1">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className={cn(
                      "flex items-center gap-2 p-2 cursor-pointer rounded-sm hover:bg-muted",
                      value?.id === school.id && "bg-muted"
                    )}
                    onClick={() => handleSchoolSelect(school)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value?.id === school.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{school.name}</div>
                      {school.location && (
                        <div className="text-sm text-muted-foreground truncate">
                          {school.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {inputValue.trim() && !schools.some(s => s.name.toLowerCase() === inputValue.toLowerCase()) && (
                  <div className="p-1 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualEntry}
                      className="w-full"
                    >
                      Add "{inputValue}" manually
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
