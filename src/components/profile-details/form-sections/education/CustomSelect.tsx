
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
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";

type TableName = 'majors' | 'schools' | 'companies' | 'careers';
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

type InsertData = {
  majors: Database['public']['Tables']['majors']['Insert'];
  schools: Database['public']['Tables']['schools']['Insert'];
  companies: Database['public']['Tables']['companies']['Insert'];
  careers: Database['public']['Tables']['careers']['Insert'];
}

interface TableRecord {
  id: string;
  [key: string]: any;
}

export function CustomSelect({ 
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
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();

  // Filter options client-side based on debounced search query
  const filteredOptions = options.filter(option => {
    const searchValue = option[titleField]?.toLowerCase() || '';
    return searchValue.includes(debouncedSearchQuery.toLowerCase());
  });

  const handleCustomSubmit = async () => {
    try {
      // First, check if the entry already exists
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

      if (existingData && 'id' in existingData) {
        const record = existingData as TableRecord;
        // If it exists, use the existing entry
        handleSelectChange(fieldName, record.id);
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
          name: customValue
        } as InsertData['schools'] | InsertData['companies'];
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
        const record = data as TableRecord;
        handleSelectChange(fieldName, record.id);
        setShowCustomInput(false);
        setCustomValue("");
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

  return (
    <div>
      <label className="text-sm font-medium">{placeholder}</label>
      {!showCustomInput ? (
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
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={`Select your ${placeholder.toLowerCase()}`} />
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
            {filteredOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option[titleField]}
              </SelectItem>
            ))}
            <SelectItem value="other">Other (Add New)</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className="space-y-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder={`Enter ${placeholder.toLowerCase()}`}
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
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
