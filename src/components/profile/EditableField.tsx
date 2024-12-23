import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EditButton } from "./editable/EditButton";
import { InputField } from "./editable/InputField";
import { SelectField } from "./editable/SelectField";
import { CustomSelect } from "./editable/CustomSelect";

const degreeOptions = [
  "No Degree",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "MD",
  "PhD"
] as const;

type TableName = 'majors' | 'schools' | 'companies' | 'careers';
type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
type TitleField = 'title' | 'name';

interface TableRecord {
  id: string;
  title?: string;
  name?: string;
}

interface EditableFieldProps {
  label: string;
  value: string | null;
  fieldName: string;
  profileId: string;
  onUpdate?: (newValue: string) => void;
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

  // Fetch options for select fields
  const { data: options } = useQuery({
    queryKey: ['field-options', fieldName],
    queryFn: async () => {
      if (!['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)) {
        return null;
      }

      const tableMap: Record<FieldName, TableName> = {
        academic_major_id: 'majors',
        school_id: 'schools',
        position: 'careers',
        company_id: 'companies'
      };

      const table = tableMap[fieldName as FieldName];
      const titleField: TitleField = fieldName === 'school_id' || fieldName === 'company_id' ? 'name' : 'title';

      const { data, error } = await supabase
        .from(table)
        .select(`id, ${titleField}`)
        .eq('status', 'Approved')
        .order(titleField);
      
      if (error) {
        console.error('Error fetching options:', error);
        return [];
      }

      // Ensure the data matches our TableRecord interface
      return (data || []).map(item => ({
        id: item.id,
        ...(titleField === 'name' ? { name: item[titleField] } : { title: item[titleField] })
      })) as TableRecord[];
    },
    enabled: ['academic_major_id', 'school_id', 'position', 'company_id'].includes(fieldName)
  });

  const updateField = async (newValue: string) => {
    try {
      console.log('Updating field:', { fieldName, newValue, profileId });
      
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: newValue })
        .eq('id', profileId);

      if (error) throw error;

      console.log('Field updated successfully');
      
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
      const tableMap: Record<FieldName, TableName> = {
        academic_major_id: 'majors',
        school_id: 'schools',
        position: 'careers',
        company_id: 'companies'
      };
      
      const table = tableMap[fieldName as FieldName];
      const titleField: TitleField = fieldName === 'school_id' || fieldName === 'company_id' ? 'name' : 'title';
      
      return (
        <CustomSelect
          value={editValue}
          options={options}
          placeholder={`Select a ${label.toLowerCase()}`}
          tableName={table}
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