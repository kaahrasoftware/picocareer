
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SelectWithCustomOptionProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  handleSelectChange: (event: any, value: string) => void;
  fieldName: string;
  titleField: 'title' | 'name';
  onCancel: () => void;
}

export function SelectWithCustomOption({
  value,
  options,
  placeholder,
  handleSelectChange,
  fieldName,
  titleField,
  onCancel
}: SelectWithCustomOptionProps) {
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddCustom = async () => {
    if (!customValue.trim()) return;

    setIsSubmitting(true);
    try {
      const tableName = getTableName(fieldName);
      const insertData = getInsertData(fieldName, customValue.trim());

      const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${customValue} has been added and will be reviewed by administrators.`,
      });

      handleSelectChange(null, data.id);
      setShowCustomDialog(false);
      setCustomValue('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add custom option",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTableName = (fieldName: string) => {
    switch (fieldName) {
      case 'academic_major_id': return 'majors';
      case 'school_id': return 'schools';
      case 'company_id': return 'companies';
      case 'position': return 'careers';
      default: return 'majors';
    }
  };

  const getInsertData = (fieldName: string, value: string) => {
    const statusValue = 'Pending' as const;
    
    switch (fieldName) {
      case 'academic_major_id':
        return { title: value, description: '', status: statusValue };
      case 'school_id':
        return { name: value, status: statusValue };
      case 'company_id':
        return { name: value, status: statusValue };
      case 'position':
        return { title: value, description: '', status: statusValue };
      default:
        return { title: value, description: '', status: statusValue };
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={(newValue) => handleSelectChange(null, newValue)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option[titleField]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Option</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Enter custom option..."
            />
            <div className="flex gap-2">
              <Button onClick={handleAddCustom} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add"}
              </Button>
              <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button onClick={onCancel} variant="outline" size="sm">
        Cancel
      </Button>
    </div>
  );
}
