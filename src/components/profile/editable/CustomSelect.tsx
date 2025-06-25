import React from 'react';
import { SelectWithCustomOption } from "./SelectWithCustomOption";

type TableName = 'majors' | 'schools' | 'companies' | 'careers';
type FieldName = 'academic_major_id' | 'school_id' | 'company_id' | 'position';
type TitleField = 'title' | 'name';

interface CustomSelectProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  tableName: TableName;
  fieldName: FieldName;
  titleField: TitleField;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function CustomSelect({
  value,
  options,
  placeholder,
  tableName,
  fieldName,
  titleField,
  onSave,
  onCancel
}: CustomSelectProps) {
  return (
    <SelectWithCustomOption
      value={value}
      options={options}
      placeholder={placeholder}
      tableName={tableName}
      handleSelectChange={(_, value) => onSave(value)}
      fieldName={fieldName}
      titleField={titleField}
      onCancel={onCancel}
    />
  );
}