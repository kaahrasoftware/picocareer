import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

type TableName = 'majors' | 'schools' | 'careers';
type Status = 'Approved' | 'Pending' | 'Rejected';

interface Option {
  id: string;
  title?: string;
  name?: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  placeholder: string;
  tableName: TableName;
  onSelect: (value: string) => void;
  onCancel: () => void;
}

export function SelectWithCustomOption({ 
  value, 
  options: initialOptions, 
  placeholder, 
  tableName,
  onSelect,
  onCancel,
}: CustomSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  // Fetch options based on table name
  const { data: options } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      let query = supabase
        .from(tableName)
        .select('id, title, name')
        .eq('status', 'Approved')
        .order(tableName === 'careers' ? 'title' : 'name', { ascending: true });

      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return [];
      }
      return data || [];
    },
  });

  const handleCustomSubmit = async () => {
    try {
      // First, check if entry already exists
      const { data: existingData, error: existingError } = await supabase
        .from(tableName)
        .select('id')
        .eq(tableName === 'careers' ? 'title' : 'name', customValue)
        .maybeSingle();

      if (existingError) {
        console.error('Error checking existing entry:', existingError);
        toast({
          title: "Error",
          description: "Failed to check for existing entry. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingData) {
        // If it exists, use the existing entry
        onSelect(existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // If it doesn't exist, create a new entry
      const insertData = tableName === 'careers' 
        ? {
            title: customValue,
            description: `Career in ${customValue}`,
            status: 'Pending' as Status
          }
        : {
            name: customValue,
            status: 'Pending' as Status
          };

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error(`Failed to add new ${tableName}:`, error);
        toast({
          title: "Error",
          description: `Failed to add new ${tableName}. Please try again.`,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        onSelect(data.id);
        setShowCustomInput(false);
        setCustomValue("");
        toast({
          title: "Success",
          description: `Successfully added new ${tableName === 'careers' ? 'career' : 'school'}. It will be reviewed by an admin.`,
        });
      }
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
          placeholder={`Enter ${tableName === 'careers' ? 'career' : 'school'} name`}
          className="mt-1"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
              onCancel();
            }}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Select
      value={value}
      onValueChange={(value) => {
        if (value === "other") {
          setShowCustomInput(true);
        } else {
          onSelect(value);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.title || option.name}
          </SelectItem>
        ))}
        <SelectItem value="other">Other (Add New)</SelectItem>
      </SelectContent>
    </Select>
  );
}