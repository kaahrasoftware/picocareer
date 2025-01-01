import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditButton } from "../EditButton";
import { TextField } from "./TextField";

interface DetailFieldProps {
  value: string | null;
  fieldName: string;
  placeholder?: string;
  className?: string;
  onSave: (value: string) => Promise<void>;
  isEditing: boolean;
  onEditClick: () => void;
  onCancelEdit: () => void;
}

export function DetailField({
  value,
  fieldName,
  placeholder,
  className,
  onSave,
  isEditing,
  onEditClick,
  onCancelEdit
}: DetailFieldProps) {
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
      <TextField
        value={value || ''}
        onSave={onSave}
        onCancel={onCancelEdit}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className="flex items-center justify-between">
      <p className={className || 'text-sm text-muted-foreground'}>
        {renderValue()}
      </p>
      <EditButton onClick={onEditClick} />
    </div>
  );
}