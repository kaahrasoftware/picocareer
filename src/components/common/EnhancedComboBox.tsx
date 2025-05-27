
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
        const tableNames = ['profiles', 'companies', 'schools', 'majors'] as const;
        type TableName = typeof tableNames[number];
        
        // Check if the provided table name is valid
        const isValidTable = tableNames.includes(table as TableName);
        
        if (!isValidTable) {
          console.error(`Invalid table name: ${table}`);
          setOptions([]);
          return;
        }
        
        // Type-safe query with proper error handling
        const { data, error } = await supabase
          .from(table as TableName)
          .select(`id, ${valueField}, ${labelField}`)
          .limit(50);
          
        if (error) {
          console.error('Error fetching options:', error);
          setOptions([]);
          return;
        }
        
        // Ensure all items have required properties and handle null values
        if (data && Array.isArray(data)) {
          const validData = data.filter(item => {
            if (!item || typeof item !== 'object') return false;
            if (!('id' in item) || typeof item.id !== 'string') return false;
            if (!item[valueField] || !item[labelField]) return false;
            // Additional null checks
            if (item[valueField] === null || item[labelField] === null) return false;
            return true;
          }).map(item => {
            // Safe item handling with null checks
            if (!item || typeof item !== 'object') {
              return { id: '', [valueField]: '', [labelField]: 'Unnamed' };
            }
            
            return {
              ...item,
              // Ensure we have fallback values
              [valueField]: item[valueField] || '',
              [labelField]: item[labelField] || 'Unnamed'
            };
          });
          setOptions(validData);
        } else {
          setOptions([]);
        }
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
