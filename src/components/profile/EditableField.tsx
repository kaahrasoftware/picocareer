import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditButton } from "./editable/EditButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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

  // Fetch schools data
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: fieldName === 'school_id'
  });

  // Fetch majors data
  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
    enabled: fieldName === 'academic_major_id'
  });

  // Fetch companies data
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) throw error;
      return data || [];
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
    if (fieldName === 'highest_degree') {
      return (
        <div className="space-y-2">
          <Select
            value={editValue}
            onValueChange={(value) => {
              updateField(value);
              setEditValue(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select degree" />
            </SelectTrigger>
            <SelectContent>
              {degreeOptions.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (fieldName === 'school_id' && schools) {
      return (
        <div className="space-y-2">
          <Select
            value={editValue}
            onValueChange={(value) => {
              updateField(value);
              setEditValue(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (fieldName === 'academic_major_id' && majors) {
      return (
        <div className="space-y-2">
          <Select
            value={editValue}
            onValueChange={(value) => {
              updateField(value);
              setEditValue(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select major" />
            </SelectTrigger>
            <SelectContent>
              {majors.map((major) => (
                <SelectItem key={major.id} value={major.id}>
                  {major.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    if (fieldName === 'company_id' && companies) {
      return (
        <div className="space-y-2">
          <Select
            value={editValue}
            onValueChange={(value) => {
              updateField(value);
              setEditValue(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2 justify-end">
          <Button onClick={() => updateField(editValue)} size="sm">
            Save
          </Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
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