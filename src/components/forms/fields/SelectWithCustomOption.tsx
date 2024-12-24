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
import { Database } from "@/integrations/supabase/types";

type Status = Database["public"]["Enums"]["status"];

interface SelectWithCustomOptionProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  tableName: 'majors' | 'schools' | 'companies' | 'careers';
}

type InsertData = {
  majors: {
    title: string;
    description: string;
    status: Status;
  };
  schools: {
    name: string;
    status: Status;
  };
  companies: {
    name: string;
    status: Status;
  };
  careers: {
    title: string;
    description: string;
    status: Status;
  };
}

interface TableRecord {
  id: string;
  title?: string;
  name?: string;
}

export function SelectWithCustomOption({
  value,
  onValueChange,
  options,
  placeholder,
  tableName,
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const handleCustomSubmit = async () => {
    try {
      // First check if entry already exists
      const { data: existingData, error: checkError } = await supabase
        .from(tableName)
        .select('id, name, title')
        .eq(tableName === 'majors' || tableName === 'careers' ? 'title' : 'name', customValue)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingData && 'id' in existingData) {
        const record = existingData as TableRecord;
        onValueChange(record.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // If it doesn't exist, create new entry
      let insertData: InsertData[typeof tableName];

      if (tableName === 'majors' || tableName === 'careers') {
        insertData = {
          title: customValue,
          description: `Custom ${tableName === 'majors' ? 'major' : 'position'}: ${customValue}`,
          status: 'Pending'
        };
      } else {
        insertData = {
          name: customValue,
          status: 'Pending'
        };
      }

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
            onClick={() => setShowCustomInput(false)}
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
          onValueChange(value);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.title || option.name || ''}
          </SelectItem>
        ))}
        <SelectItem value="other">Other (Add New)</SelectItem>
      </SelectContent>
    </Select>
  );
}