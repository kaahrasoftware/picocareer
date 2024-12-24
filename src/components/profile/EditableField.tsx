import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EditButton } from "./editable/EditButton";
import { SelectWithCustomOption } from "./editable/SelectWithCustomOption";

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

  // Fetch majors if the field is academic_major
  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      if (fieldName !== 'academic_major') return null;
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'academic_major'
  });

  // Fetch schools if the field is school_name
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      if (fieldName !== 'school_name') return null;
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'school_name'
  });

  const updateField = async (newValue: string) => {
    try {
      let updateField = fieldName;
      if (fieldName === 'academic_major') {
        updateField = 'academic_major_id';
      } else if (fieldName === 'school_name') {
        updateField = 'school_id';
      }

      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: newValue })
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
    if (fieldName === 'school_name' && schools) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={schools}
          placeholder="Select a school"
          tableName="schools"
          onSelect={(value) => updateField(value)}
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    if (fieldName === 'academic_major' && majors) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={majors}
          placeholder="Select a major"
          tableName="majors"
          onSelect={(value) => updateField(value)}
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    return (
      <div className="flex gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={() => updateField(editValue)}
          size="sm"
        >
          Save
        </Button>
        <Button 
          onClick={() => {
            setIsEditing(false);
            setEditValue(value || "");
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
    <div className="flex items-center justify-between group">
      <span className="text-muted-foreground">{value || "Not set"}</span>
      <EditButton onClick={() => setIsEditing(true)} />
    </div>
  );
}