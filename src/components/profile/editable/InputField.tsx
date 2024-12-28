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

  if (fieldName === 'school_id') {
    return (
      <div className="space-y-2">
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
          <Button onClick={onSave} size="sm">
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
        className="min-h-[100px] bg-gray-50 rounded-md p-2 border"
      />
      <div className="flex gap-2 justify-end">
        <Button onClick={onSave} size="sm">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}