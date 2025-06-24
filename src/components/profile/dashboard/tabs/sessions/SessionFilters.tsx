
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SessionFiltersProps {
  onFilterChange: (filter: string, value: string) => void;
}

export function SessionFilters({ onFilterChange }: SessionFiltersProps) {
  return (
    <div className="flex gap-4 items-end">
      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select onValueChange={(value) => onFilterChange('status', value)}>
          <SelectTrigger id="status-filter" className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
