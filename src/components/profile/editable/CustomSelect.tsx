
import React from 'react';
import { SelectWithCustomOption } from "./SelectWithCustomOption";

interface CustomSelectProps {
  value: string;
  options: Array<{ id: string; title?: string; name?: string }>;
  placeholder: string;
  fieldName: string;
  titleField: 'title' | 'name';
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function CustomSelect({
  value,
  options,
  placeholder,
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
      handleSelectChange={(_, value) => onSave(value)}
      fieldName={fieldName}
      titleField={titleField}
      onCancel={onCancel}
    />
  );
}
