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

interface SelectWithCustomOptionProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  tableName: 'majors' | 'schools';
  onSelect: (value: string) => void;
  onCancel: () => void;
}

export function SelectWithCustomOption({
  value,
  options,
  placeholder,
  tableName,
  onSelect,
  onCancel
}: SelectWithCustomOptionProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const { toast } = useToast();

  const handleCustomSubmit = async () => {
    try {
      // First, check if entry already exists
      const { data: existingData, error: existingError } = await supabase
        .from(tableName)
        .select('id, title, name')
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

      onSelect(data.id);
      setShowCustomInput(false);
      setCustomValue("");
      
      toast({
        title: "Success",
        description: `New ${tableName === 'majors' ? 'major' : 'school'} added successfully!`,
      });
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
      <div className="flex gap-2">
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          className="flex-1"
          placeholder={`Enter ${tableName === 'majors' ? 'major' : 'school'} name`}
        />
        <Button 
          onClick={handleCustomSubmit}
          size="sm"
        >
          Add
        </Button>
        <Button 
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