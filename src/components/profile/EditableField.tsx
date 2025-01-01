import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SelectField } from './editable/fields/SelectField';
import { DegreeField } from './editable/fields/DegreeField';
import { SocialLinkField } from './editable/fields/SocialLinkField';
import { DetailField } from './editable/fields/DetailField';

export interface EditableFieldProps {
  label: string;
  value: string | undefined | null;
  fieldName: string;
  profileId: string;
  className?: string;
  placeholder?: string;
  isEditing?: boolean;
}

export function EditableField({ 
  label, 
  value, 
  fieldName, 
  profileId,
  className,
  placeholder,
  isEditing = false
}: EditableFieldProps) {
  const [isLocalEditing, setIsLocalEditing] = useState(false);
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
      
      setIsLocalEditing(false);
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
    if (!isEditing && !isLocalEditing) return null;

    switch (fieldName) {
      case 'position':
      case 'company_id':
        return (
          <SelectField
            fieldName={fieldName}
            value={value || ''}
            onSave={handleSave}
            onCancel={() => setIsLocalEditing(false)}
          />
        );
      case 'highest_degree':
        return (
          <DegreeField
            value={value || ''}
            onSave={handleSave}
            onCancel={() => setIsLocalEditing(false)}
          />
        );
      default:
        return null;
    }
  };

  const isSocialField = fieldName.endsWith('_url');

  return (
    <div className="space-y-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      
      {isSocialField ? (
        <SocialLinkField
          value={value || null}
          fieldName={fieldName}
          onSave={handleSave}
          isEditing={isEditing || isLocalEditing}
          onEditClick={() => setIsLocalEditing(true)}
          onCancelEdit={() => setIsLocalEditing(false)}
        />
      ) : (
        renderEditField() || (
          <DetailField
            value={value || null}
            fieldName={fieldName}
            placeholder={placeholder}
            className={className}
            onSave={handleSave}
            isEditing={isEditing || isLocalEditing}
            onEditClick={() => setIsLocalEditing(true)}
            onCancelEdit={() => setIsLocalEditing(false)}
          />
        )
      )}
    </div>
  );
}