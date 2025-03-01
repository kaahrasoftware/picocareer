
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
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { HubOnboardingGuideDialog } from "./HubOnboardingGuideDialog";

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
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showGuideDialog, setShowGuideDialog] = useState(false);
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
        
        // Switch to welcome dialog
        setShowWelcomeDialog(true);
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to confirm membership",
          variant: "destructive",
        });
        onClose();
      }
    } catch (error: any) {
      console.error("Error confirming membership:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm membership",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcomeDialog(false);
    onClose();
  };

  const handleStartGuide = () => {
    setShowWelcomeDialog(false);
    setShowGuideDialog(true);
  };

  const handleGuideClose = () => {
    setShowGuideDialog(false);
    onClose();
  };

  // Show confirmation dialog first
  if (!showWelcomeDialog && !showGuideDialog) {
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

  // Show welcome dialog after confirmation
  if (showWelcomeDialog) {
    return (
      <Dialog open={showWelcomeDialog} onOpenChange={handleWelcomeClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to {hubName}!</DialogTitle>
            <DialogDescription>
              Your membership has been confirmed. You now have access to all hub features and content.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
              <p className="text-sm text-muted-foreground">
                You can now access announcements, resources, member directories, and participate in community discussions. Explore the different tabs to get started.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleWelcomeClose}>
              Close
            </Button>
            <Button onClick={handleStartGuide}>
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show guide dialog
  return (
    <HubOnboardingGuideDialog 
      isOpen={showGuideDialog} 
      onClose={handleGuideClose} 
      hubName={hubName} 
    />
  );
}
