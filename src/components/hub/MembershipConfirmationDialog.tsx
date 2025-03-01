
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface MembershipConfirmationDialogProps {
  hubId: string;
  hubName: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MembershipConfirmationDialog({
  hubId,
  hubName,
  description,
  open,
  onOpenChange,
}: MembershipConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const { data, error } = await supabase.rpc('confirm_hub_membership', {
        _hub_id: hubId,
      });

      if (error) {
        throw error;
      }

      // Parse response from the RPC function
      const response = typeof data === 'object' ? data : JSON.parse(String(data));
      
      if (response && response.success === true) {
        toast({
          title: "Membership Confirmed",
          description: response.message || `You are now a member of ${hubName}`,
        });
        
        // Invalidate and refetch queries
        queryClient.invalidateQueries({ queryKey: ['hub-member-status', hubId] });
        queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
        
        onOpenChange(false);
      } else {
        toast({
          title: "Confirmation Failed",
          description: response?.message || "There was a problem confirming your membership.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Confirmation Failed",
        description: error.message || "There was a problem confirming your membership.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Membership to {hubName}</DialogTitle>
          <DialogDescription>
            You have been invited to join this hub. Please confirm to access all features.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
