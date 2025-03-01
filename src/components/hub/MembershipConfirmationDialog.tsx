
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface MembershipConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hubId: string;
  hubName: string;
}

export function MembershipConfirmationDialog({ 
  isOpen, 
  onClose,
  hubId,
  hubName
}: MembershipConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      
      const { data, error } = await supabase.rpc('confirm_hub_membership', {
        _hub_id: hubId
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        toast({
          title: "Membership Confirmed",
          description: data.message || `You have confirmed your membership in ${hubName}`,
        });
        
        // Refresh hub data and member status
        queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
        queryClient.invalidateQueries({ queryKey: ['hub-member-role', hubId] });
        queryClient.invalidateQueries({ queryKey: ['hub-pending-members', hubId] });
        
        onClose();
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to confirm membership",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error confirming membership:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm membership",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Hub Membership</DialogTitle>
          <DialogDescription>
            You have been added to {hubName}. Would you like to confirm your membership?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            By confirming, you'll get access to all the hub's content, announcements, and features.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Later
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Membership'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
