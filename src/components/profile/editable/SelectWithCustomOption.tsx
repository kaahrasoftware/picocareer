import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { TableName } from "./types";

interface SelectWithCustomOptionProps {
  tableName: TableName;
  field: string;
  value: string | undefined;
  onChange: (value: string) => void;
}

export function SelectWithCustomOption({ tableName, field, value, onChange }: SelectWithCustomOptionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState("");
  const { toast } = useToast();
  const { session, profile } = useAuthSession();
  const isAdmin = profile?.user_type === 'admin';

  const { data, refetch } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      try {
        let query = supabase.from(tableName).select('id, name, title');
        
        // Add status filter for non-admin users
        if (!isAdmin) {
          query = query.eq('status', 'Approved');
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error(`Error in query for ${tableName}:`, error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleCancelClick = () => {
    setIsAdding(false);
    setNewOption("");
  };

  const handleSaveClick = async () => {
    if (!newOption.trim()) {
      toast({
        title: "Error",
        description: "New option cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const insertData = {
        title: newOption,
        name: newOption,
        status: isAdmin ? 'Approved' : 'Pending'
      };

      const { error } = await supabase
        .from(tableName)
        .insert([insertData]);

      if (error) {
        console.error(`Error inserting into ${tableName}:`, error);
        toast({
          title: "Error",
          description: `Could not add new ${tableName}.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `New ${tableName} added successfully!`,
      });
      
      setNewOption("");
      setIsAdding(false);
      await refetch();
    } catch (error) {
      console.error(`Error in insert for ${tableName}:`, error);
      toast({
        title: "Error",
        description: "Failed to add new option.",
        variant: "destructive",
      });
    }
  };

  const options = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item: any) => {
      // Handle both title and name fields safely
      const label = item.title || item.name || 'Unknown';
      return {
        value: item.id,
        label: label
      };
    });
  }, [data]);

  return (
    <div>
      <Select onValueChange={onChange} defaultValue={value}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={`Select ${field}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value="add_new" onClick={(e) => {
              e.stopPropagation(); // Prevent the select from closing
              handleAddClick();
            }}
          >
            Add New
          </SelectItem>
        </SelectContent>
      </Select>

      {isAdding && (
        <div className="flex mt-2">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder={`New ${field}`}
            className="mr-2"
          />
          <Button size="sm" variant="outline" onClick={handleSaveClick}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancelClick}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
