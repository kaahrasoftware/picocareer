import React from 'react';
import { Button } from "@/components/ui/button";
import { SelectWithCustomOption } from "../SelectWithCustomOption";
import { useFieldOptions } from "../useFieldOptions";
import { FieldName } from "../types";

interface SelectFieldProps {
  fieldName: FieldName;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

const degreeOptions = [
  { id: "No Degree", title: "No Degree" },
  { id: "High School", title: "High School" },
  { id: "Associate", title: "Associate" },
  { id: "Bachelor", title: "Bachelor" },
  { id: "Master", title: "Master" },
  { id: "MD", title: "MD" },
  { id: "PhD", title: "PhD" }
];

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
      case 'highest_degree':
        return 'Select degree';
      default:
        return 'Select option';
    }
  };

  // Use degree options for highest_degree field
  const finalOptions = fieldName === 'highest_degree' ? degreeOptions : options;

  return (
    <SelectWithCustomOption
      value={value}
      options={finalOptions}
      placeholder={getPlaceholder()}
      tableName={fieldName === 'company_id' ? 'companies' : 
                fieldName === 'school_id' ? 'schools' :
                fieldName === 'academic_major_id' ? 'majors' : 
                fieldName === 'position' ? 'careers' : 'majors'}
      fieldName={fieldName}
      titleField={fieldName === 'company_id' || fieldName === 'school_id' ? 'name' : 'title'}
      handleSelectChange={(_, value) => onSave(value)}
      onCancel={onCancel}
    />
  );
}