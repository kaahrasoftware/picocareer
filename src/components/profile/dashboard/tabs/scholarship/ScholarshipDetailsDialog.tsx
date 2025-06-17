
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScholarshipDetails } from "@/types/database/scholarships";

interface ScholarshipDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scholarship?: ScholarshipDetails;
  scholarshipId?: string; // Add this for compatibility
  open?: boolean; // Add this for compatibility
  onOpenChange?: (open: boolean) => void; // Add this for compatibility
  onScholarshipUpdated?: () => void; // Add this for compatibility
}

export function ScholarshipDetailsDialog({ 
  isOpen, 
  open, 
  onClose, 
  onOpenChange,
  scholarship 
}: ScholarshipDetailsDialogProps) {
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipDetails | null>(null);
  const dialogOpen = isOpen || open || false;

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (!newOpen) {
      onClose();
    }
  };

  const handleScholarshipUpdate = (updatedScholarship: any) => {
    // Ensure currency is included
    const normalizedScholarship: ScholarshipDetails = {
      ...updatedScholarship,
      currency: updatedScholarship.currency || 'USD', // Default currency
    };
    
    setSelectedScholarship(normalizedScholarship);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
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
