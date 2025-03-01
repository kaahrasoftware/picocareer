
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface MembershipConfirmationDialogProps {
  hubId: string;
  hubName: string;
  description?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('confirm_hub_membership', {
        _hub_id: hubId
      });

      if (error) throw error;

      if (data.success) {
        setIsConfirmed(true);
        toast({
          title: "Membership Confirmed",
          description: data.message,
        });

        // Invalidate any relevant queries
        queryClient.invalidateQueries({ queryKey: ['hub', hubId] });
        queryClient.invalidateQueries({ queryKey: ['hub-member-status', hubId] });
        
        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false);
          setIsConfirmed(false);
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to confirm membership");
      }
    } catch (error: any) {
      console.error("Error confirming membership:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm membership",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Join {hubName}</DialogTitle>
          <DialogDescription className="pt-2">
            {isConfirmed ? (
              <div className="flex flex-col items-center py-4">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-center font-medium">
                  You have successfully joined {hubName}!
                </p>
              </div>
            ) : (
              <>
                <p>You've been added to this hub by an administrator.</p>
                {description && <p className="mt-2">{description}</p>}
                <p className="mt-2">
                  Confirm your membership to access all features and resources.
                </p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!isConfirmed && (
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Membership"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
