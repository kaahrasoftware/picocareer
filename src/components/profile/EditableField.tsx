import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const updateFieldMutation = useMutation({
    mutationFn: async (newValue: string) => {
      if (fieldName === 'academic_major' && showCustomInput) {
        // First, create the new major
        const { data: majorData, error: majorError } = await supabase
          .from('majors')
          .insert([
            { 
              title: newValue,
              description: `Custom major: ${newValue}`
            }
          ])
          .select('id')
          .single();

        if (majorError) throw majorError;

        // Then update the profile with the new major's ID
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ academic_major_id: majorData.id })
          .eq('id', profileId);

        if (profileError) throw profileError;
        return newValue;
      } else {
        const updateField = fieldName === 'academic_major' ? 'academic_major_id' : fieldName;
        const updateValue = fieldName === 'academic_major' 
          ? newValue 
          : newValue;

        const { error } = await supabase
          .from('profiles')
          .update({ [updateField]: updateValue })
          .eq('id', profileId);

        if (error) throw error;
        return newValue;
      }
    },
    onSuccess: (newValue) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['majors'] });

      toast({
        title: "Success",
        description: "Field updated successfully",
      });

      if (onUpdate) {
        onUpdate(newValue);
      }
      setIsEditing(false);
      setShowCustomInput(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
      setEditValue(value || "");
      setShowCustomInput(false);
    },
  });

  if (isEditing) {
    if (fieldName === 'academic_major' && !showCustomInput) {
      return (
        <div className="flex gap-2">
          <Select
            value={editValue}
            onValueChange={(value) => {
              if (value === "other") {
                setShowCustomInput(true);
              } else {
                updateFieldMutation.mutate(value);
              }
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a major" />
            </SelectTrigger>
            <SelectContent>
              {majors?.map((major) => (
                <SelectItem key={major.id} value={major.id}>
                  {major.title}
                </SelectItem>
              ))}
              <SelectItem value="other">Other (Add New)</SelectItem>
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

    if (showCustomInput) {
      return (
        <div className="flex gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => updateFieldMutation.mutate(editValue)}
            size="sm"
            disabled={updateFieldMutation.isPending}
          >
            Save
          </Button>
          <Button 
            onClick={() => {
              setShowCustomInput(false);
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
          onClick={() => updateFieldMutation.mutate(editValue)}
          size="sm"
          disabled={updateFieldMutation.isPending}
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