
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedComboBoxProps {
  table: string;
  valueField: string;
  labelField: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export function EnhancedComboBox({
  table,
  valueField,
  labelField,
  placeholder = 'Select an option',
  value,
  onChange
}: EnhancedComboBoxProps) {
  const [options, setOptions] = useState<{ id: string; [key: string]: any }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        // Convert string table name to a type-safe approach
        // This avoids the deep instantiation and type errors
        const tableNames = ['profiles', 'companies', 'schools', 'majors'] as const;
        type TableName = typeof tableNames[number];
        
        // Check if the provided table name is valid
        const isValidTable = tableNames.includes(table as TableName);
        
        if (!isValidTable) {
          console.error(`Invalid table name: ${table}`);
          setOptions([]);
          return;
        }
        
        // Type-safe query
        const { data, error } = await supabase
          .from(table as TableName)
          .select(`id, ${valueField}, ${labelField}`)
          .limit(50);
          
        if (error) throw error;
        
        // Ensure all items have an id property
        const validData = (data || []).filter(item => item.id);
        setOptions(validData);
      } catch (error) {
        console.error('Error fetching options:', error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptions();
  }, [table, valueField, labelField]);
  
  // Render a simple select input
  return (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-input bg-background px-3 py-2"
      disabled={isLoading}
    >
      <option value="">{isLoading ? 'Loading...' : placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option[labelField] || 'Unnamed'}
        </option>
      ))}
    </select>
  );
}
