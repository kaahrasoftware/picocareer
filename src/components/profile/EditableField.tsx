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
  className?: string;
  placeholder?: string;
}

export function EditableField({ 
  label, 
  value, 
  fieldName, 
  profileId,
  className,
  placeholder 
}: EditableFieldProps) {
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
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      
      {isEditing ? (
        renderEditField()
      ) : (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${className || 'text-muted-foreground'}`}>
            {value || placeholder || 'Not set'}
          </p>
          <EditButton onClick={() => setIsEditing(true)} />
        </div>
      )}
    </div>
  );
}