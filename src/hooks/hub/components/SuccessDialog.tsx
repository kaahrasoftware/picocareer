
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Hub } from "../types/invitation";

interface SuccessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  hub: Hub | null;
}

export function SuccessDialog({ isOpen, onOpenChange, hub }: SuccessDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitation Found!</DialogTitle>
          <DialogDescription>
            You have been invited to join {hub?.name}. Would you like to visit the hub?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button 
            onClick={() => navigate(`/hubs/${hub?.id}`)}
          >
            Visit Hub
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
