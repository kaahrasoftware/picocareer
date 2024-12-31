import React, { useState } from 'react';
import { EditButton } from './editable/EditButton';
import { TextField } from './editable/fields/TextField';
import { SelectField } from './editable/fields/SelectField';
import { DegreeField } from './editable/fields/DegreeField';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditableFieldProps {
  label: string;
  value: string | undefined | null;
  fieldName: string;
  profileId: string;
}

export function EditableField({ label, value, fieldName, profileId }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const handleSave = async (newValue: string) => {
    try {
      console.log('Updating profile field:', { fieldName, newValue });
      
      const { error } = await supabase
        .from('profiles')
        .update({ [fieldName]: newValue })
        .eq('id', profileId);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderEditField = () => {
    if (!isEditing) return null;

    switch (fieldName) {
      case 'position':
        return (
          <SelectField
            fieldName={fieldName}
            value={value || ''}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        );
      case 'highest_degree':
        return (
          <DegreeField
            value={value || ''}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        );
      default:
        return (
          <TextField
            value={value || ''}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <EditButton onClick={() => setIsEditing(true)} />
      </div>
      
      {isEditing ? (
        renderEditField()
      ) : (
        <p className="text-sm text-muted-foreground">
          {value || 'Not set'}
        </p>
      )}
    </div>
  );
}