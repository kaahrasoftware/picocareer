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

type TableName = 'majors' | 'schools' | 'careers';
type TitleField = 'title' | 'name';

interface Option {
  id: string;
  [key: string]: any;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  placeholder: string;
  tableName: TableName;
  handleSelectChange: (name: string, value: string) => void;
  fieldName: string;
  onCancel?: () => void;
}

export function SelectWithCustomOption({ 
  value, 
  options, 
  placeholder, 
  handleSelectChange,
  tableName,
  fieldName,
  onCancel
}: CustomSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const handleCustomSubmit = async () => {
    try {
      // First, check if entry already exists
      const titleField = tableName === 'schools' ? 'name' : 'title';
      const { data: existingData, error: existingError } = await supabase
        .from(tableName)
        .select(`id, ${titleField}`)
        .eq(titleField, customValue)
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
        handleSelectChange(fieldName, existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // If it doesn't exist, create a new entry
      let insertData: Record<string, any> = {
        status: 'Pending' as const
      };

      if (tableName === 'majors') {
        insertData = {
          ...insertData,
          title: customValue,
          description: `Custom major: ${customValue}`
        };
      } else if (tableName === 'careers') {
        insertData = {
          ...insertData,
          title: customValue,
          description: `Position: ${customValue}`
        };
      } else {
        insertData = {
          ...insertData,
          name: customValue
        };
      }

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
        handleSelectChange(fieldName, data.id);
        setShowCustomInput(false);
        setCustomValue("");
        toast({
          title: "Success",
          description: `Successfully added new ${tableName === 'majors' ? 'major' : tableName === 'careers' ? 'position' : 'school'}.`,
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

  const displayValue = (option: Option) => {
    return option.title || option.name || '';
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter ${tableName === 'majors' ? 'major' : tableName === 'careers' ? 'position' : 'school'} name`}
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
              if (onCancel) onCancel();
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
          handleSelectChange(fieldName, value);
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {displayValue(option)}
          </SelectItem>
        ))}
        <SelectItem value="other">Other (Add New)</SelectItem>
      </SelectContent>
    </Select>
  );
}