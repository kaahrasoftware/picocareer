import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditableFieldProps {
  label?: string;
  value: string | null;
  fieldName: string;
  profileId: string;
  placeholder?: string;
  className?: string;
}

export function EditableField({
  value,
  fieldName,
  profileId,
  placeholder,
  className,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value || "");

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

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave(editedValue);
    } else if (e.key === 'Escape') {
      handleCancel();
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

  if (isEditing) {
    return (
      <div className="flex gap-2">
        <Input
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={className}
          placeholder={placeholder}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleSave(editedValue)}>
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{renderValue()}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="h-6 px-2"
      >
        Edit
      </Button>
    </div>
  );
}