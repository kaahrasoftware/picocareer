import { useState } from "react";
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
  const { toast } = useToast();

  // Fetch all options for the given table with pagination
  const { data: allOptions } = useQuery({
    queryKey: [tableName, 'all', searchQuery],
    queryFn: async () => {
      console.log(`Fetching ${tableName} with search: ${searchQuery}`);
      let allData = [];
      let start = 0;
      const pageSize = 1000;
      let hasMore = true;
      let totalCount = 0;
      let firstPage = true;

      while (hasMore) {
        console.log(`Fetching page starting at ${start}`);
        let query = supabase
          .from(tableName)
          .select('id, name, title', { count: 'exact' });

        // Add range for pagination
        query = query.range(start, start + pageSize - 1);

        // Add ordering
        query = query.order(tableName === 'majors' || tableName === 'careers' ? 'title' : 'name');

        // Add search filter if query exists
        if (searchQuery) {
          if (tableName === 'majors' || tableName === 'careers') {
            query = query.ilike('title', `%${searchQuery}%`);
          } else {
            query = query.ilike('name', `%${searchQuery}%`);
          }
        }

        const { data, error, count } = await query;
        
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw error;
        }

        // On first page, get the total count
        if (firstPage && count !== null) {
          totalCount = count;
          console.log(`Total records in database: ${totalCount}`);
          firstPage = false;
        }

        if (!data || data.length === 0) {
          console.log('No more data to fetch');
          hasMore = false;
          break;
        }

        console.log(`Fetched ${data.length} records on this page`);
        allData = [...allData, ...data];
        
        // If we got less than pageSize records, we've reached the end
        if (data.length < pageSize) {
          console.log('Last page reached (less than pageSize records returned)');
          hasMore = false;
        } else {
          // Only continue if we haven't fetched all records yet
          if (totalCount > 0 && allData.length >= totalCount) {
            console.log(`Fetched all ${allData.length} records of ${totalCount}`);
            hasMore = false;
          } else {
            start += pageSize;
            console.log(`Moving to next page, start: ${start}`);
          }
        }
      }
      
      console.log(`Total ${tableName} fetched:`, allData.length);
      return allData;
    },
    enabled: true
  });

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
    } catch (error) {
      console.error(`Failed to add new ${tableName}:`, error);
      toast({
        title: "Error",
        description: `Failed to add new ${tableName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Combine provided options with fetched options, removing duplicates
  const combinedOptions = [...options];
  if (allOptions) {
    allOptions.forEach(option => {
      if (!combinedOptions.some(existing => existing.id === option.id)) {
        combinedOptions.push(option);
      }
    });
  }

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
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="h-[200px]">
            {combinedOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.title || option.name || ''}
              </SelectItem>
            ))}
            <SelectItem value="other">Other (Add New)</SelectItem>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}