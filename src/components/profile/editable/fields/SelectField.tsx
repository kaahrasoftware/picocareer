import React from 'react';
import { SelectWithCustomOption } from "../SelectWithCustomOption";
import { useFieldOptions } from "../useFieldOptions";
import { FieldName } from "../types";

interface SelectFieldProps {
  fieldName: FieldName;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function SelectField({ 
  fieldName, 
  value, 
  onSave, 
  onCancel 
}: SelectFieldProps) {
  const { data: options = [] } = useFieldOptions(fieldName);

  const getPlaceholder = () => {
    switch (fieldName) {
      case 'academic_major_id':
        return 'Select major';
      case 'school_id':
        return 'Select school';
      case 'company_id':
        return 'Select company';
      case 'position':
        return 'Select position';
      default:
        return 'Select option';
    }
  };

  const getTableName = () => {
    switch (fieldName) {
      case 'academic_major_id':
        return 'majors';
      case 'school_id':
        return 'schools';
      case 'company_id':
        return 'companies';
      case 'position':
        return 'careers';
      default:
        return 'majors';
    }
  };

  return (
    <SelectWithCustomOption
      value={value}
      options={options}
      placeholder={getPlaceholder()}
      tableName={getTableName()}
      fieldName={fieldName}
      titleField={fieldName === 'school_id' || fieldName === 'company_id' ? 'name' : 'title'}
      handleSelectChange={(_, value) => onSave(value)}
      onCancel={onCancel}
    />
  );
}