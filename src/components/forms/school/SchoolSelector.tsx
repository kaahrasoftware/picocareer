
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { School } from "@/types/database/schools";
import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface SchoolSelectorProps {
  value?: School | null;
  onValueChange: (school: School | null) => void;
  disabled?: boolean;
}

export function SchoolSelector({ value, onValueChange, disabled }: SchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search to avoid too many API calls
  const debouncedSetSearch = useDebouncedCallback((query: string) => {
    setSearchQuery(query);
  }, 300);

  const { data: schools = [], isLoading, error } = useQuery({
    queryKey: ['schools-search', searchQuery],
    queryFn: async () => {
      // Only search if we have at least 2 characters
      if (!searchQuery || searchQuery.length < 2) {
        return [];
      }

      let query = supabase
        .from('schools')
        .select('id, name, type, city, state, country, status')
        .eq('status', 'Approved')
        .order('name');

      // Search in school name
      query = query.ilike('name', `%${searchQuery}%`);

      const { data, error } = await query.limit(100); // Increased limit for better search results
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return (data || []).map(school => ({
        ...school,
        // Handle null location by constructing from city, state, country
        location: [school.city, school.state, school.country]
          .filter(Boolean)
          .join(', ') || 'Location not specified'
      })) as School[];
    },
    enabled: searchQuery.length >= 2, // Only run query when we have enough characters
    staleTime: 30000, // Cache results for 30 seconds
  });

  const handleSearchChange = (query: string) => {
    debouncedSetSearch(query);
  };

  const getDisplayValue = () => {
    if (!value) return "Select school...";
    
    const location = value.location || [value.city, value.state, value.country]
      .filter(Boolean)
      .join(', ') || '';
    
    return `${value.name}${value.type ? ` (${value.type})` : ''}${location ? ` - ${location}` : ''}`;
  };

  const getEmptyMessage = () => {
    if (!searchQuery) {
      return "Type at least 2 characters to search schools...";
    }
    if (isLoading) {
      return "Searching schools...";
    }
    if (error) {
      return "Error loading schools. Please try again.";
    }
    if (searchQuery.length < 2) {
      return "Type at least 2 characters to search...";
    }
    return "No schools found matching your search.";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          disabled={disabled}
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search schools by name..." 
              onValueChange={handleSearchChange}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandEmpty className="py-6 text-center text-sm">
            {getEmptyMessage()}
          </CommandEmpty>
          {searchQuery.length >= 2 && (
            <CommandGroup className="max-h-64 overflow-auto">
              {schools.map((school) => (
                <CommandItem
                  key={school.id}
                  onSelect={() => {
                    onValueChange(value?.id === school.id ? null : school);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.id === school.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{school.name}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {school.type ? `${school.type} • ` : ''}{school.location || 'Location not specified'}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
