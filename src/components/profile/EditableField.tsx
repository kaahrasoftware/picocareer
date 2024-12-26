import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditButton } from "./editable/EditButton";
import { InputField } from "./editable/InputField";
import { SelectField } from "./editable/SelectField";
import { CustomSelect } from "./editable/CustomSelect";
import { useFieldOptions } from "./editable/useFieldOptions";
import { EditableFieldProps, FieldName } from "./editable/types";

const degreeOptions = [
  "No Degree",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "MD",
  "PhD"
] as const;

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
  const { data: options } = useFieldOptions(fieldName);

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

  if (isEditing) {
    // Custom select fields (with option to add new items)
    if (['school_id', 'academic_major_id', 'position', 'company_id'].includes(fieldName) && options) {
      const tableName = fieldName === 'school_id' ? 'schools' 
        : fieldName === 'academic_major_id' ? 'majors'
        : fieldName === 'position' ? 'careers'
        : 'companies';
      
      const titleField = tableName === 'schools' || tableName === 'companies' ? 'name' : 'title';

      return (
        <CustomSelect
          value={editValue}
          options={options}
          placeholder={`Select a ${label.toLowerCase()}`}
          tableName={tableName}
          fieldName={fieldName as FieldName}
          titleField={titleField}
          onSave={updateField}
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    // Degree select field
    if (fieldName === 'highest_degree') {
      return (
        <SelectField
          value={editValue}
          options={degreeOptions}
          placeholder="Select your highest degree"
          onSave={updateField}
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    // Default input field
    return (
      <InputField
        value={editValue}
        onChange={setEditValue}
        onSave={() => updateField(editValue)}
        onCancel={() => {
          setIsEditing(false);
          setEditValue(value || "");
        }}
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