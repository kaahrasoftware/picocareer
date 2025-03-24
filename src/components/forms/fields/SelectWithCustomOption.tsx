
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useDebounce, useDebouncedCallback } from "@/hooks/useDebounce";

type Status = Database["public"]["Enums"]["status"];

interface SelectWithCustomOptionProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ id: string; title?: string; name?: string; }>;
  placeholder: string;
  tableName: 'majors' | 'schools' | 'companies' | 'careers';
}

export function SelectWithCustomOption({
  value = "",
  onValueChange,
  options,
  placeholder,
  tableName,
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [localOptions, setLocalOptions] = useState<Array<{ id: string; title?: string; name?: string; }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  // Use a longer debounce time to give user more time to type
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  // Pre-populate with provided options
  useEffect(() => {
    if (options && options.length > 0) {
      setLocalOptions(options);
    }
  }, [options]);

  // Fetch options for the given table with debounced search
  const { data: allOptions, isLoading } = useQuery({
    queryKey: [tableName, 'all', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
        return options; // Return the initial options if search query is too short
      }
      
      setIsSearching(true);
      console.log(`Fetching ${tableName} with search: ${debouncedSearchQuery}`);
      
      try {
        // Ensure query is safe
        const safeQuery = String(debouncedSearchQuery).toLowerCase();
        
        let query = supabase
          .from(tableName)
          .select('id, name, title')
          .limit(50); // Limit to 50 results for performance

        // Add search filter if query exists
        if (safeQuery) {
          if (tableName === 'majors' || tableName === 'careers') {
            query = query.ilike('title', `%${safeQuery}%`);
          } else {
            query = query.ilike('name', `%${safeQuery}%`);
          }
        }

        // Add ordering
        query = query.order(tableName === 'majors' || tableName === 'careers' ? 'title' : 'name');

        const { data, error } = await query;
        
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw error;
        }

        console.log(`Fetched ${data?.length || 0} ${tableName}`);
        return data || [];
      } catch (error) {
        console.error(`Error in search query:`, error);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    enabled: debouncedSearchQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });

  // Update local options when new data arrives from query
  useEffect(() => {
    if (allOptions && allOptions.length > 0) {
      // Combine with existing options, removing duplicates
      setLocalOptions(prevOptions => {
        const combined = [...prevOptions];
        allOptions.forEach(option => {
          if (!combined.some(existing => existing.id === option.id)) {
            combined.push(option);
          }
        });
        return combined;
      });
    }
  }, [allOptions]);

  // Client-side filtering for faster response
  const filteredOptions = searchQuery.length > 0
    ? localOptions.filter(option => {
        const searchValue = (option.title || option.name || '').toLowerCase();
        return searchValue.includes(searchQuery.toLowerCase());
      })
    : localOptions;

  // Debounced search handler to prevent excessive state updates
  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

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
        .select(`id, ${tableName === 'majors' || tableName === 'careers' ? 'title' : 'name'}`)
        .eq(tableName === 'majors' || tableName === 'careers' ? 'title' : 'name', customValue)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingData) {
        onValueChange(existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // Create new entry
      const insertData = tableName === 'majors' || tableName === 'careers' 
        ? { title: customValue, description: `Custom ${tableName === 'majors' ? 'major' : 'position'}: ${customValue}`, status: 'Pending' as Status }
        : { name: customValue, status: 'Pending' as Status };

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully added new ${tableName === 'majors' ? 'major' : tableName === 'careers' ? 'position' : tableName.slice(0, -1)}.`,
      });

      onValueChange(data.id);
      setShowCustomInput(false);
      setCustomValue("");
      
      // Add the new item to local options
      setLocalOptions(prev => [...prev, data]);
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
          placeholder={`Enter ${tableName === 'majors' ? 'major' : tableName === 'careers' ? 'position' : tableName.slice(0, -1)} name`}
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
    <div className="w-full">
      <Select
        value={value}
        onValueChange={(newValue) => {
          if (newValue === "other") {
            setShowCustomInput(true);
          } else {
            onValueChange(newValue);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search..."
              defaultValue={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="h-[200px]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.title || option.name || ''}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground">
                {isLoading || isSearching ? 'Searching...' : 'No results found'}
              </div>
            )}
            <SelectItem value="other">Other (Add New)</SelectItem>
          </ScrollArea>
        </SelectContent>
      </Select>
      {(isLoading || isSearching) && (
        <div className="flex items-center justify-center mt-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
