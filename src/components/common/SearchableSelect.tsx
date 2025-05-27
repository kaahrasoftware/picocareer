
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchableSelectProps {
  table: string;
  valueField?: string;
  labelField?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
}

export function SearchableSelect({
  table,
  valueField = 'id',
  labelField = 'name',
  placeholder = 'Search...',
  value,
  onChange
}: SearchableSelectProps) {
  const [options, setOptions] = useState<{ id: string; [key: string]: any }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
        
        // Type-safe query
        const { data, error } = await supabase
          .from(table as TableName)
          .select(`id, ${valueField}, ${labelField}`)
          .limit(50);
          
        if (error) {
          console.error('Error fetching options:', error);
          setOptions([]);
          return;
        }
        
        // Ensure all items have an id property and are the correct type
        const validData = (data || []).filter(item => item && typeof item.id === 'string');
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
  
  // Filter options based on search query
  const filteredOptions = searchQuery 
    ? options.filter(option => 
        String(option[labelField] || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;
  
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 mb-2"
        disabled={isLoading}
      />
      
      <select 
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2"
        disabled={isLoading}
      >
        <option value="">{isLoading ? 'Loading...' : 'Select an option'}</option>
        {filteredOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option[labelField] || 'Unnamed'}
          </option>
        ))}
      </select>
    </div>
  );
}
