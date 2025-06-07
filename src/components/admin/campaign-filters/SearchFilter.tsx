
import React from 'react';
import { SearchInput } from '@/components/community/filters/SearchInput';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search campaigns..."
      className="w-full"
    />
  );
}
