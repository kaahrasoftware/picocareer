
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScholarshipDetails } from "@/types/database/scholarships";

interface ScholarshipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scholarship?: ScholarshipDetails;
}

export function ScholarshipDetailsDialog({ isOpen, onClose, scholarship }: ScholarshipDetailsDialogProps) {
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipDetails | null>(null);

  const handleScholarshipUpdate = (updatedScholarship: any) => {
    // Ensure currency is included
    const normalizedScholarship: ScholarshipDetails = {
      ...updatedScholarship,
      currency: updatedScholarship.currency || 'USD', // Default currency
    };
    
    setSelectedScholarship(normalizedScholarship);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Scholarship Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {scholarship && (
            <div>
              <h3 className="text-lg font-semibold">{scholarship.title}</h3>
              <p className="text-muted-foreground">{scholarship.description}</p>
              <p className="text-sm">Amount: {scholarship.amount} {scholarship.currency}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
