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

  if (fieldName === 'school_id') {
    return (
      <div className="space-y-4">
        <SelectWithCustomOption
          value={value}
          options={schools || []}
          placeholder="Select your school"
          tableName="schools"
          fieldName="school_id"
          titleField="name"
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
  }

  if (fieldName === 'academic_major_id') {
    return (
      <div className="space-y-4">
        <SelectWithCustomOption
          value={value}
          options={majors || []}
          placeholder="Select your major"
          tableName="majors"
          fieldName="academic_major_id"
          titleField="title"
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
  }

  if (fieldName === 'company_id') {
    return (
      <div className="space-y-4">
        <SelectWithCustomOption
          value={value}
          options={companies || []}
          placeholder="Select your company"
          tableName="companies"
          fieldName="company_id"
          titleField="name"
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
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter text..."
        className="min-h-[100px] bg-gray-50 dark:bg-gray-800 rounded-md p-2 border resize-y"
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