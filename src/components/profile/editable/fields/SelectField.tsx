import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  if (fieldName === 'company_id' || fieldName === 'school_id' || 
      fieldName === 'academic_major_id' || fieldName === 'position') {
    return (
      <SelectWithCustomOption
        value={value}
        options={options}
        placeholder={getPlaceholder()}
        tableName={fieldName === 'company_id' ? 'companies' : 
                  fieldName === 'school_id' ? 'schools' :
                  fieldName === 'academic_major_id' ? 'majors' : 'careers'}
        fieldName={fieldName}
        titleField={fieldName === 'company_id' || fieldName === 'school_id' ? 'name' : 'title'}
        handleSelectChange={(_, value) => onSave(value)}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="flex gap-2">
      <Select 
        value={value} 
        onValueChange={onSave}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.title || option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={onCancel} 
        variant="outline" 
        size="sm"
      >
        Cancel
      </Button>
    </div>
  );
}