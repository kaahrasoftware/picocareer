import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditButton } from "./editable/EditButton";
import { TextField } from "./editable/fields/TextField";
import { SelectField } from "./editable/fields/SelectField";
import { DegreeField } from "./editable/fields/DegreeField";
import { FieldName } from "./editable/types";

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

  const updateField = async (newValue: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: newValue })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Field updated successfully",
      });

      if (onUpdate) {
        onUpdate(newValue);
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

  // Disable editing for company_id field
  if (fieldName === 'company_id') {
    return (
      <div className="flex items-center justify-between group">
        <span className="text-muted-foreground">{value || "Not set"}</span>
      </div>
    );
  }

  if (isEditing) {
    if (fieldName === 'highest_degree') {
      return (
        <DegreeField
          value={editValue}
          onSave={(value) => {
            updateField(value);
            setEditValue(value);
          }}
          onCancel={() => setIsEditing(false)}
        />
      );
    }

    if (['academic_major_id', 'school_id', 'company_id', 'position'].includes(fieldName)) {
      return (
        <SelectField
          fieldName={fieldName as FieldName}
          value={editValue}
          onSave={(value) => {
            updateField(value);
            setEditValue(value);
          }}
          onCancel={() => setIsEditing(false)}
        />
      );
    }

    return (
      <TextField
        value={editValue}
        onChange={setEditValue}
        onSave={() => updateField(editValue)}
        onCancel={() => setIsEditing(false)}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <span className="text-muted-foreground">{value || "Not set"}</span>
      <EditButton onClick={() => setIsEditing(true)} />
    </div>
  );
}