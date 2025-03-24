
import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TableName, FieldName, TitleField, InsertData, Status } from "./types";
import { useDebounce } from "@/hooks/useDebounce";

interface SelectWithCustomOptionProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string; }>;
  placeholder: string;
  handleSelectChange: (name: string, value: string) => void;
  tableName: TableName;
  fieldName: FieldName;
  titleField: TitleField;
  onCancel?: () => void;
}

export function SelectWithCustomOption({ 
  value = "", 
  options = [],
  placeholder,
  handleSelectChange,
  tableName,
  fieldName,
  titleField,
  onCancel
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { toast } = useToast();

  const filteredOptions = options.filter(option => {
    const searchValue = option[titleField]?.toLowerCase() || '';
    return searchValue.includes(debouncedSearchQuery.toLowerCase());
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
        .select(`id, ${titleField}`)
        .eq(titleField, customValue)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingData) {
        handleSelectChange(fieldName, existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // Create new entry
      const insertData: InsertData[typeof tableName] = {
        status: 'Pending' as Status,
        ...(tableName === 'majors' || tableName === 'careers' 
          ? {
              title: customValue,
              description: `Custom ${tableName === 'majors' ? 'major' : 'position'}: ${customValue}`
            }
          : {
              name: customValue
            })
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Successfully added new ${tableName === 'companies' ? 'company' : 
                     tableName === 'schools' ? 'school' : 
                     tableName === 'majors' ? 'major' : 'position'}.`,
      });

      handleSelectChange(fieldName, data.id);
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
          placeholder={`Enter ${tableName === 'companies' ? 'company' : 
                       tableName === 'schools' ? 'school' : 
                       tableName === 'majors' ? 'major' : 'position'} name`}
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleCustomSubmit}
            size="sm"
            type="button"
          >
            Add
          </Button>
          <Button
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue("");
              if (onCancel) onCancel();
            }}
            variant="outline"
            size="sm"
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Ensure value exists in options before using it
  const isValidValue = value && options.some(option => option.id === value);

  return (
    <div className="w-full">
      <Select
        value={isValidValue ? value : undefined}
        onValueChange={(newValue) => {
          if (newValue === "other") {
            setShowCustomInput(true);
          } else {
            handleSelectChange(fieldName, newValue);
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
            {filteredOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option[titleField] || ''}
              </SelectItem>
            ))}
            <SelectItem value="other">Other (Add New)</SelectItem>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
