
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface MembershipConfirmationDialogProps {
  hubId: string;
  hubName: string;
  hubDescription?: string;
  onConfirmed: () => void;
}

export function MembershipConfirmationDialog({
  hubId,
  hubName,
  hubDescription,
  onConfirmed
}: MembershipConfirmationDialogProps) {
  const [open, setOpen] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const { data, error } = await supabase.rpc('confirm_hub_membership', {
        _hub_id: hubId
      });

      if (error) throw error;

      toast({
        title: "Membership confirmed",
        description: `You're now a confirmed member of ${hubName}`,
      });

      setOpen(false);
      onConfirmed();
    } catch (error: any) {
      console.error('Error confirming membership:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm membership. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDecline = () => {
    setOpen(false);
    // Just close the dialog without confirming - they can still view basic hub info
    toast({
      title: "Membership not confirmed",
      description: "You can confirm your membership later to get full access",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to {hubName}</DialogTitle>
          <DialogDescription>
            You've been added to this hub. Please confirm your membership to access all features.
            {hubDescription && (
              <p className="mt-2">{hubDescription}</p>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleDecline} disabled={isConfirming}>
            Later
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Membership"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
