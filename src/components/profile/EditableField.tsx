import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const updateFieldMutation = useMutation({
    mutationFn: async (newValue: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: newValue })
        .eq('id', profileId);

      if (error) throw error;
      return newValue;
    },
    onSuccess: (newValue) => {
      // Update the cache with the new value
      queryClient.setQueryData(['profile'], (oldData: any) => ({
        ...oldData,
        [fieldName]: newValue,
      }));

      toast({
        title: "Success",
        description: "Field updated successfully",
      });

      if (onUpdate) {
        onUpdate(newValue);
      }
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
      // Reset to previous value on error
      setEditValue(value || "");
    },
  });

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="font-medium">{label}:</label>
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
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group">
      <div>
        <span className="font-medium">{label}:</span>{" "}
        <span className="text-muted-foreground">{value || "Not set"}</span>
      </div>
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