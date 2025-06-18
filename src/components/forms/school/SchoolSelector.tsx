
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

interface SchoolSelectorProps {
  value?: School | null;
  onValueChange: (school: School | null) => void;
  disabled?: boolean;
}

export function SchoolSelector({ value, onValueChange, disabled }: SchoolSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools-for-update', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('schools')
        .select('id, name, type, location, status')
        .eq('status', 'Approved')
        .order('name');

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      
      return (data || []) as Pick<School, 'id' | 'name' | 'type' | 'location' | 'status'>[];
    }
  });

  const filteredSchools = useMemo(() => {
    if (!searchQuery) return schools;
    return schools.filter(school => 
      school.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [schools, searchQuery]);

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
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search schools..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>
            {isLoading ? "Loading schools..." : "No schools found."}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filteredSchools.map((school) => (
              <CommandItem
                key={school.id}
                onSelect={() => {
                  const fullSchool = school as School;
                  onValueChange(value?.id === school.id ? null : fullSchool);
                  setOpen(false);
                }}
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
                    {school.type} • {school.location}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
