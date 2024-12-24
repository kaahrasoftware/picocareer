import React from 'react';
import { SelectWithCustomOption } from "./SelectWithCustomOption";

interface CustomSelectProps {
  value: string;
  options: any[];
  placeholder: string;
  tableName: string;
  fieldName: string;
  titleField: string;
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
      handleSelectChange={onSave}
      fieldName={fieldName}
      titleField={titleField}
      onCancel={onCancel}
    />
  );
}