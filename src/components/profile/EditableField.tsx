import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Save, X } from "lucide-react";

export interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldName: string;
  profileId: string;
  onUpdate?: (value: string) => void;
}

export function EditableField({ 
  label, 
  value, 
  fieldName, 
  profileId, 
  onUpdate 
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const { toast } = useToast();

  const updateField = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: editValue })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Field updated successfully",
      });

      if (onUpdate) {
        onUpdate(editValue);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="w-full"
        />
        <div className="flex gap-2 justify-end">
          <Button onClick={updateField} size="sm">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <span className="text-muted-foreground">{value || "Not set"}</span>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}