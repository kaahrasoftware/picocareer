import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export function EditableField({ label, value, fieldName, profileId, onUpdate }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const { toast } = useToast();

  // Fetch majors if the field is academic_major
  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      if (fieldName !== 'academic_major_id') return null;
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'academic_major_id'
  });

  // Fetch schools if the field is school
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      if (fieldName !== 'school_id') return null;
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'school_id'
  });

  const updateField = async (newValue: string) => {
    let valueToUpdate = newValue;

    // Handle array fields
    if (['skills', 'tools_used', 'keywords', 'fields_of_interest'].includes(fieldName)) {
      valueToUpdate = `{${newValue.split(',').map(item => item.trim()).filter(Boolean).join(',')}}`;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ [fieldName]: valueToUpdate })
      .eq('id', profileId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Field updated successfully",
    });

    if (onUpdate) {
      onUpdate(newValue);
    }
    return true;
  };

  if (isEditing) {
    if (fieldName === 'academic_major_id' && majors) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={majors}
          onSave={async (value) => {
            const success = await updateField(value);
            if (success) {
              setIsEditing(false);
            }
          }}
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
          tableName="majors"
          placeholder="Major"
        />
      );
    }

    if (fieldName === 'school_id' && schools) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={schools}
          onSave={async (value) => {
            const success = await updateField(value);
            if (success) {
              setIsEditing(false);
            }
          }}
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
          tableName="schools"
          placeholder="School"
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
          onClick={async () => {
            const success = await updateField(editValue);
            if (success) {
              setIsEditing(false);
            }
          }}
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