import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const degreeOptions = [
  "No Degree",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "MD",
  "PhD"
] as const;

interface DegreeFieldProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

export function DegreeField({ value, onSave, onCancel }: DegreeFieldProps) {
  return (
    <div className="space-y-2">
      <Select
        value={value}
        onValueChange={onSave}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select degree" />
        </SelectTrigger>
        <SelectContent>
          {degreeOptions.map((degree) => (
            <SelectItem key={degree} value={degree}>
              {degree}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}