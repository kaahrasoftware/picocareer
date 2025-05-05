
import React, { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

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
  const [localSearch, setLocalSearch] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState(recipientsList);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filter recipients based on local search
  useEffect(() => {
    if (!localSearch) {
      setFilteredRecipients(recipientsList);
      return;
    }

    setIsFiltering(true);
    const searchTerm = localSearch.toLowerCase();
    
    // Apply filter with small delay to avoid UI freezing with large lists
    const timeoutId = setTimeout(() => {
      const filtered = recipientsList.filter(recipient => {
        const name = recipient.full_name?.toLowerCase() || '';
        const email = recipient.email.toLowerCase();
        return name.includes(searchTerm) || email.includes(searchTerm);
      });
      setFilteredRecipients(filtered);
      setIsFiltering(false);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [localSearch, recipientsList]);

  const toggleAllRecipients = (checked: boolean) => {
    if (checked) {
      // Select all visible/filtered recipients
      const idsToAdd = filteredRecipients
        .filter(r => !selectedRecipients.includes(r.id))
        .map(r => r.id);
      setSelectedRecipients([...selectedRecipients, ...idsToAdd]);
    } else {
      // Deselect all visible/filtered recipients
      const filteredIds = new Set(filteredRecipients.map(r => r.id));
      setSelectedRecipients(selectedRecipients.filter(id => !filteredIds.has(id)));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <Input 
          placeholder="Search recipients..." 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="mb-2"
        />
      </div>
      
      {/* Select All Option */}
      {filteredRecipients.length > 0 && (
        <div className="flex items-center pb-1 mb-1 border-b">
          <Checkbox 
            id="select-all-recipients"
            checked={filteredRecipients.length > 0 && 
              filteredRecipients.every(r => selectedRecipients.includes(r.id))}
            onCheckedChange={toggleAllRecipients}
          />
          <Label 
            htmlFor="select-all-recipients"
            className="ml-2 font-bold"
          >
            Select All {filteredRecipients.length > 0 ? `(${filteredRecipients.length})` : ''}
          </Label>
        </div>
      )}
      
      <div className="grid gap-2 max-h-64 overflow-y-auto border rounded p-2">
        {isFiltering ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Filtering...</span>
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            {recipientsList.length === 0 ? 
              "No recipients found. Please select a different recipient type." :
              "No recipients match your search criteria."}
          </div>
        ) : (
          filteredRecipients.map(recipient => (
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
                className="text-sm flex-1"
              >
                {recipient.full_name || recipient.email}
                {recipient.full_name && (
                  <span className="text-muted-foreground text-xs ml-2">
                    {recipient.email}
                  </span>
                )}
              </Label>
            </div>
          ))
        )}
      </div>
      
      {selectedRecipients.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
