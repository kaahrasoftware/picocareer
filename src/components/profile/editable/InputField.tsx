import React from 'react';
import { Button } from "@/components/ui/button";
import { SelectWithCustomOption } from "./SelectWithCustomOption";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  fieldName?: string;
}

export function InputField({ value, onChange, onSave, onCancel, fieldName }: InputFieldProps) {
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

  const renderSelectField = (options: any[], placeholder: string, tableName: 'schools' | 'majors' | 'companies', titleField: 'name' | 'title') => (
    <div className="space-y-4">
      <SelectWithCustomOption
        value={value}
        options={options}
        placeholder={placeholder}
        tableName={tableName}
        fieldName={fieldName as any}
        titleField={titleField}
        handleSelectChange={(_, value) => onChange(value)}
        onCancel={onCancel}
      />
      <div className="flex gap-2 justify-end">
        <Button onClick={onSave} size="sm" variant="default">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );

  if (fieldName === 'school_id') {
    return renderSelectField(schools || [], "Select your school", "schools", "name");
  }

  if (fieldName === 'academic_major_id') {
    return renderSelectField(majors || [], "Select your major", "majors", "title");
  }

  if (fieldName === 'company_id') {
    return renderSelectField(companies || [], "Select your company", "companies", "name");
  }

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text..."
        className="w-full min-h-[100px] bg-background border rounded-md p-2 resize-y focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2 justify-end">
        <Button onClick={onSave} size="sm" variant="default">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}