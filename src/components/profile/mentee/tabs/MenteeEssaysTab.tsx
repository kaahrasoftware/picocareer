
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MenteeEssayForm } from "../forms/MenteeEssayForm";

interface MenteeEssaysTabProps {
  profileId: string;
}

export function MenteeEssaysTab({ profileId }: MenteeEssaysTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState<any>(null);

  const handleEditEssay = (essay: any) => {
    setSelectedEssay(essay);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEssay(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Essays</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Essay
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEssay ? 'Edit Essay' : 'New Essay'}
            </DialogTitle>
          </DialogHeader>
          <MenteeEssayForm
            menteeId={profileId}
            essay={selectedEssay}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Essay list would go here */}
      <div className="text-center py-8 text-muted-foreground">
        <p>No essays yet. Click "Add Essay" to get started.</p>
      </div>
    </div>
  );
}
