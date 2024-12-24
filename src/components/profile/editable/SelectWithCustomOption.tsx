import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SelectWithCustomOptionProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  onSave: (value: string) => void;
  onCancel: () => void;
  tableName: 'majors' | 'schools';
  placeholder: string;
}

export function SelectWithCustomOption({
  value,
  options,
  onSave,
  onCancel,
  tableName,
  placeholder,
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const handleCustomSubmit = async () => {
    try {
      // Check if entry already exists
      const { data: existingData, error: existingError } = await supabase
        .from(tableName)
        .select('id, title, name')
        .eq(tableName === 'schools' ? 'name' : 'title', customValue)
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
        onSave(existingData.id);
        setShowCustomInput(false);
        setCustomValue("");
        return;
      }

      // Create new entry if it doesn't exist
      const insertData = tableName === 'majors' 
        ? { 
            title: customValue,
            description: `Custom major: ${customValue}`
          }
        : { 
            name: customValue,
            type: 'University'
          };

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select('id')
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
        onSave(data.id);
        setShowCustomInput(false);
        setCustomValue("");
        toast({
          title: "Success",
          description: `Successfully added new ${tableName.slice(0, -1)}.`,
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
          placeholder={`Enter ${placeholder.toLowerCase()}`}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleCustomSubmit}
            size="sm"
            type="button"
          >
            Save
          </Button>
          <Button
            onClick={() => {
              setShowCustomInput(false);
              onCancel();
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
    <div className="flex gap-2">
      <Select
        value={value}
        onValueChange={(value) => {
          if (value === "other") {
            setShowCustomInput(true);
          } else {
            onSave(value);
          }
        }}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={`Select ${placeholder.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name || option.title}
            </SelectItem>
          ))}
          <SelectItem value="other">Other (Add New)</SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={onCancel}
        variant="outline"
        size="sm"
        type="button"
      >
        Cancel
      </Button>
    </div>
  );
}