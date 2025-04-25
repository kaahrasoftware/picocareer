
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RecipientSelectionProps {
  recipientsList: {id: string, email: string, full_name?: string}[];
  selectedRecipients: string[];
  setSelectedRecipients: (ids: string[]) => void;
}

export function RecipientSelection({ 
  recipientsList, 
  selectedRecipients, 
  setSelectedRecipients 
}: RecipientSelectionProps) {
  return (
    <div className="grid gap-2 max-h-64 overflow-y-auto border rounded p-2">
      {recipientsList.map(recipient => (
        <div key={recipient.id} className="flex items-center space-x-2">
          <Checkbox 
            id={`recipient-${recipient.id}`}
            checked={selectedRecipients.includes(recipient.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedRecipients([...selectedRecipients, recipient.id]);
              } else {
                setSelectedRecipients(selectedRecipients.filter(id => id !== recipient.id));
              }
            }}
          />
          <Label 
            htmlFor={`recipient-${recipient.id}`}
            className="text-sm"
          >
            {recipient.full_name || recipient.email}
          </Label>
        </div>
      ))}
    </div>
  );
}
