
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RecipientType = 'all' | 'mentees' | 'mentors' | 'selected';

interface RecipientTypeSelectorProps {
  recipientType: RecipientType;
  setRecipientType: (t: RecipientType) => void;
}

export function RecipientTypeSelector({ recipientType, setRecipientType }: RecipientTypeSelectorProps) {
  return (
    <div>
      <label className="block font-medium mb-1">Recipient Type</label>
      <Select 
        value={recipientType}
        onValueChange={setRecipientType}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select recipient type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="mentees">Mentees Only</SelectItem>
          <SelectItem value="mentors">Mentors Only</SelectItem>
          <SelectItem value="selected">Select Specific Users</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
