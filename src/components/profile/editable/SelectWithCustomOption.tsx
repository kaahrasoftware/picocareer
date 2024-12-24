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
import type { Database } from '@/integrations/supabase/types';
import { useToast } from "@/hooks/use-toast";

type TableName = 'majors' | 'schools' | 'careers' | 'companies';
type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
type TitleField = 'title' | 'name';

interface CustomSelectProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  handleSelectChange: (name: string, value: string) => void;
  tableName: TableName;
  fieldName: FieldName;
  titleField: TitleField;
}

type TableInsertData = {
  majors: Database['public']['Tables']['majors']['Insert'];
  schools: Database['public']['Tables']['schools']['Insert'];
  companies: Database['public']['Tables']['companies']['Insert'];
  careers: Database['public']['Tables']['careers']['Insert'];
}

interface TableRecord {
  id: string;
  [key: string]: any;
}

export function SelectWithCustomOption({ 
  value, 
  options, 
  placeholder, 
  handleSelectChange,
  tableName,
  fieldName,
  titleField,
}: CustomSelectProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const getTitleField = (table: TableName): TitleField => {
    return table === 'majors' || table === 'careers' ? 'title' : 'name';
  };

  const handleCustomSubmit = async () => {
    try {
      const titleField = getTitleField(tableName);
      
      // First, check if entry already exists
      const { data: existingData } = await supabase
        .from(tableName)
        .select(`id, ${titleField}`)
        .eq(titleField, customValue)
        .maybeSingle();

      if (existingData && 'id' in existingData) {
        // If it exists, use the existing entry
        handleSelectChange(fieldName, existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // If it doesn't exist, create a new entry
      let insertData: Partial<TableInsertData[TableName]>;
      
      if (tableName === 'majors') {
        insertData = {
          title: customValue,
          description: `Custom major: ${customValue}`,
          status: 'Pending' as const
        };
      } else if (tableName === 'careers') {
        insertData = {
          title: customValue,
          description: `Position: ${customValue}`,
          status: 'Pending' as const
        };
      } else {
        insertData = {
          name: customValue,
          status: 'Pending' as const
        };
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select(`id, ${titleField}`)
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

      if (data && 'id' in data) {
        handleSelectChange(fieldName, data.id);
        setShowCustomInput(false);
        setCustomValue("");
        toast({
          title: "Success",
          description: `Successfully added new ${tableName === 'majors' ? 'major' : tableName === 'careers' ? 'position' : tableName === 'companies' ? 'company' : 'school'}.`,
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

  const displayValue = (option: { id: string; title?: string; name?: string }) => {
    return tableName === 'majors' || tableName === 'careers' 
      ? option.title 
      : option.name || '';
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder={`Enter ${tableName === 'majors' ? 'major' : tableName === 'careers' ? 'position' : tableName === 'companies' ? 'company' : 'school'} name`}
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