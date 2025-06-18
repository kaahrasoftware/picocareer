
import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Proper type for the partial school data used in the selector
interface PartialSchool {
  id: string;
  name: string;
  type: string;
  location?: string | null;
  status: string;
}

interface SchoolSelectorProps {
  value?: PartialSchool | null;
  onValueChange: (school: PartialSchool | null) => void;
  disabled?: boolean;
}

export function SchoolSelector({ value, onValueChange, disabled }: SchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools-for-selector', searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from('schools')
          .select('id, name, type, location, status')
          .eq('status', 'Approved')
          .order('name');

        // If there's a search query, filter by it
        if (searchQuery && searchQuery.length >= 2) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        // Remove the limit to get all schools
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching schools:', error);
          return [];
        }
        
        // Ensure we return a valid array with proper filtering
        const validSchools = (data || [])
          .filter(school => school && school.id && school.name)
          .map(school => ({
            id: school.id,
            name: school.name || '',
            type: school.type || '',
            location: school.location,
            status: school.status || ''
          })) as PartialSchool[];

        return validSchools;
      } catch (error) {
        console.error('Query error:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const filteredSchools = useMemo(() => {
    // Ensure schools is always an array
    const schoolsArray = Array.isArray(schools) ? schools : [];
    
    // If no search query, return all schools (but limit for performance)
    if (!searchQuery || searchQuery.length < 2) {
      return schoolsArray.slice(0, 100); // Show first 100 for initial load
    }
    
    // Filter by search query
    return schoolsArray.filter(school => 
      school && 
      school.name && 
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schools, searchQuery]);

  const formatLocation = (school: PartialSchool) => {
    return school.location || 'Location not specified';
  };

  const handleSelectSchool = (school: PartialSchool) => {
    onValueChange(value?.id === school.id ? null : school);
    setOpen(false);
    setSearchQuery(""); // Clear search after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value
            ? `${value.name} (${value.type})`
            : "Select school..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ zIndex: 9999 }}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search schools..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>
            {isLoading ? "Loading schools..." : searchQuery.length < 2 ? "Type at least 2 characters to search" : "No schools found."}
          </CommandEmpty>
          <CommandList>
            <CommandGroup className="max-h-64 overflow-auto">
              {Array.isArray(filteredSchools) && filteredSchools.map((school) => {
                if (!school || !school.id || !school.name) return null;
                
                return (
                  <CommandItem
                    key={school.id}
                    value={school.name}
                    onSelect={() => handleSelectSchool(school)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === school.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{school.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {school.type} • {formatLocation(school)}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
              {searchQuery.length < 2 && schools.length > 100 && (
                <CommandItem disabled className="text-center text-muted-foreground">
                  Type to search through all {schools.length} schools
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
