
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSubmitApplication } from "@/hooks/useSubmitApplication";
import { DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";

interface ApplicationFormProps {
  opportunityId: string;
  opportunityTitle: string;
  onComplete: () => void;
}

export function ApplicationForm({ opportunityId, opportunityTitle, onComplete }: ApplicationFormProps) {
  const { session } = useAuthSession();
  const [notes, setNotes] = useState("");
  const { submitApplication, isLoading } = useSubmitApplication();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      return;
    }
    
    submitApplication({
      opportunity_id: opportunityId,
      profile_id: session.user.id,
      notes: notes.trim() || undefined
    });
    
    onComplete();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Apply for Opportunity</DialogTitle>
        <DialogDescription>
          You are applying for: {opportunityTitle}
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Additional Notes (Optional)
          </label>
          <Textarea
            id="notes"
            placeholder="Add any additional information you'd like to include with your application..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}
