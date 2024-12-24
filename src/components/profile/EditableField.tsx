import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSave = async () => {
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
        <label className="font-medium">{label}:</label>
        <div className="flex gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSave} size="sm">Save</Button>
          <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">Cancel</Button>
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