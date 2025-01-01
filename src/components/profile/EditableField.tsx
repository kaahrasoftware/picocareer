import React, { useState } from 'react';
import { EditButton } from './editable/EditButton';
import { TextField } from './editable/fields/TextField';
import { SelectField } from './editable/fields/SelectField';
import { DegreeField } from './editable/fields/DegreeField';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

  // Fetch career details if position is set
  const { data: careerDetails } = useQuery({
    queryKey: ['career', value],
    queryFn: async () => {
      if (fieldName !== 'position' || !value) return null;
      
      const { data, error } = await supabase
        .from('careers')
        .select('title')
        .eq('id', value)
        .single();

      if (error) {
        console.error('Error fetching career details:', error);
        return null;
      }

      return data;
    },
    enabled: fieldName === 'position' && !!value
  });

  // Fetch company details if company_id is set
  const { data: companyDetails } = useQuery({
    queryKey: ['company', value],
    queryFn: async () => {
      if (fieldName !== 'company_id' || !value) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', value)
        .single();

      if (error) {
        console.error('Error fetching company details:', error);
        return null;
      }

      return data;
    },
    enabled: fieldName === 'company_id' && !!value
  });

  // Fetch academic major details if academic_major_id is set
  const { data: majorDetails } = useQuery({
    queryKey: ['major', value],
    queryFn: async () => {
      if (fieldName !== 'academic_major_id' || !value) return null;
      
      const { data, error } = await supabase
        .from('majors')
        .select('title')
        .eq('id', value)
        .single();

      if (error) {
        console.error('Error fetching major details:', error);
        return null;
      }

      return data;
    },
    enabled: fieldName === 'academic_major_id' && !!value
  });

  // Fetch school details if school_id is set
  const { data: schoolDetails } = useQuery({
    queryKey: ['school', value],
    queryFn: async () => {
      if (fieldName !== 'school_id' || !value) return null;
      
      const { data, error } = await supabase
        .from('schools')
        .select('name')
        .eq('id', value)
        .single();

      if (error) {
        console.error('Error fetching school details:', error);
        return null;
      }

      return data;
    },
    enabled: fieldName === 'school_id' && !!value
  });

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

  const renderValue = () => {
    if (fieldName === 'position' && careerDetails?.title) {
      return careerDetails.title;
    }
    if (fieldName === 'company_id' && companyDetails?.name) {
      return companyDetails.name;
    }
    if (fieldName === 'academic_major_id' && majorDetails?.title) {
      return majorDetails.title;
    }
    if (fieldName === 'school_id' && schoolDetails?.name) {
      return schoolDetails.name;
    }
    return value || placeholder || 'Not set';
  };

  return (
    <div className="space-y-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      
      {isEditing ? (
        renderEditField()
      ) : (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${className || 'text-muted-foreground'}`}>
            {renderValue()}
          </p>
          <EditButton onClick={() => setIsEditing(true)} />
        </div>
      )}
    </div>
  );
}