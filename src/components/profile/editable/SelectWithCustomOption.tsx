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
import { TableName, FieldName, TitleField, InsertData, Status } from "./types";

interface SelectWithCustomOptionProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  handleSelectChange: (name: string, value: string) => void;
  tableName: TableName;
  fieldName: FieldName;
  titleField: TitleField;
  onCancel?: () => void;
}

export function SelectWithCustomOption({ 
  value, 
  options, 
  placeholder, 
  handleSelectChange,
  tableName,
  fieldName,
  titleField,
  onCancel
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const handleCustomSubmit = async () => {
    try {
      // Check if entry already exists
      const { data: existingData } = await supabase
        .from(tableName)
        .select(`id, ${titleField}`)
        .eq(titleField, customValue)
        .maybeSingle();

      if (existingData) {
        handleSelectChange(fieldName, existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // Create new entry
      let insertData: Partial<InsertData[typeof tableName]> = {
        status: 'Pending' as Status
      };

      if (tableName === 'majors' || tableName === 'careers') {
        insertData = {
          ...insertData,
          title: customValue,
          description: `Custom ${tableName === 'majors' ? 'major' : 'position'}: ${customValue}`
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

  const displayValue = (option: { id: string; title?: string; name?: string }) => {
    return option[titleField] || '';
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

  return (
    <div className="w-full">
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
    </div>
  );
}