import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { EditButton } from "./editable/EditButton";
import { SelectWithCustomOption } from "./editable/SelectWithCustomOption";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const degreeOptions = [
  "No Degree",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "MD",
  "PhD"
] as const;

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

  // Fetch majors if the field is academic_major_id
  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      if (fieldName !== 'academic_major_id') return null;
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'academic_major_id'
  });

  // Fetch schools if the field is school_id
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      if (fieldName !== 'school_id') return null;
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'school_id'
  });

  // Fetch careers if the field is position
  const { data: careers } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      if (fieldName !== 'position') return null;
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'position'
  });

  // Fetch companies if the field is company_id
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      if (fieldName !== 'company_id') return null;
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: fieldName === 'company_id'
  });

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
    if (fieldName === 'school_id' && schools) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={schools}
          placeholder="Select a school"
          tableName="schools"
          handleSelectChange={updateField}
          fieldName={fieldName}
          titleField="name"
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    if (fieldName === 'academic_major_id' && majors) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={majors}
          placeholder="Select a major"
          tableName="majors"
          handleSelectChange={updateField}
          fieldName={fieldName}
          titleField="title"
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    if (fieldName === 'position' && careers) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={careers}
          placeholder="Select a position"
          tableName="careers"
          handleSelectChange={updateField}
          fieldName={fieldName}
          titleField="title"
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    if (fieldName === 'company_id' && companies) {
      return (
        <SelectWithCustomOption
          value={editValue}
          options={companies}
          placeholder="Select a company"
          tableName="companies"
          handleSelectChange={updateField}
          fieldName={fieldName}
          titleField="name"
          onCancel={() => {
            setIsEditing(false);
            setEditValue(value || "");
          }}
        />
      );
    }

    if (fieldName === 'highest_degree') {
      return (
        <div className="flex gap-2">
          <Select 
            value={editValue} 
            onValueChange={(value) => {
              updateField(value);
              setEditValue(value);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select your highest degree" />
            </SelectTrigger>
            <SelectContent>
              {degreeOptions.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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