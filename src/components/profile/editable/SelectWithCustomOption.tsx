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
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TableName = 'majors' | 'schools';
type FieldName = 'academic_major_id' | 'school_id';
type TitleField = 'title' | 'name';

interface CustomSelectProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  tableName: TableName;
  onSelect: (value: string) => void;
  onCancel: () => void;
}

type InsertData = {
  majors: Database['public']['Tables']['majors']['Insert'];
  schools: Database['public']['Tables']['schools']['Insert'];
}

type TableRecord = {
  id: string;
  title?: string;
  name?: string;
}

export function CustomSelect({ 
  value, 
  options, 
  placeholder, 
  tableName,
  onSelect,
  onCancel
}: CustomSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const handleCustomSubmit = async () => {
    try {
      // First, check if entry already exists
      const { data: existingData, error: existingError } = await supabase
        .from(tableName)
        .select(tableName === 'majors' ? 'id, title' : 'id, name')
        .eq(tableName === 'majors' ? 'title' : 'name', customValue)
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
      let insertData: InsertData[TableName];
      
      if (tableName === 'majors') {
        insertData = {
          title: customValue,
          description: `Custom major: ${customValue}`
        } as InsertData['majors'];
      } else {
        insertData = {
          name: customValue,
          type: 'University' as const // Default type for new schools
        } as InsertData['schools'];
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select(tableName === 'majors' ? 'id, title' : 'id, name')
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
          description: `Successfully added new ${tableName === 'majors' ? 'major' : 'school'}.`,
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
          placeholder={`Enter ${tableName === 'majors' ? 'major' : 'school'} name`}
          className="mt-1"
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
              onCancel();
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
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.title || option.name}
          </SelectItem>
        ))}
        <SelectItem value="other">Other (Add New)</SelectItem>
      </SelectContent>
    </Select>
  );
}