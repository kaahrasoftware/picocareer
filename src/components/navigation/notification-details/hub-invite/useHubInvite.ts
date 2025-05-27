
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useHubInvite(token: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAccept = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation token",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Accepting invitation with token:', token);
      
      toast({
        title: "Feature Coming Soon",
        description: "Hub invitations will be available in a future update.",
      });

      navigate("/hubs");
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid invitation token",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Rejecting invitation with token:', token);
      
      toast({
        title: "Invitation Declined",
        description: "You have declined the hub invitation.",
      });

      navigate("/hubs");
    } catch (error: any) {
      console.error('Error rejecting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject invitation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAccept,
    handleReject
  };
}
